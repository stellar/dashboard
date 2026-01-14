import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import * as d3 from "d3";
import D3BarChart from "./D3BarChart.jsx";
import each from "lodash/each";
import clone from "lodash/clone";

export default class LedgerChartClose extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    // Use the same colors as the original react-d3-components
    this.colorScale = d3
      .scaleOrdinal()
      .range([
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
      ]);
    this.state = {
      loading: true,
      chartWidth: 400,
      chartHeight: this.props.chartHeight || 120,
    };
    this.url = `${this.props.horizonURL}/ledgers?order=desc&limit=${this.props.limit}`;
  }

  componentDidMount() {
    this.getLedgers();
    // Update chart width
    this.updateSize();
    setInterval(() => this.updateSize(), 5000);
  }

  updateSize() {
    let value = this.panel.offsetWidth - 20;
    if (this.state.chartWidth != value) {
      this.setState({ chartWidth: value });
    }
  }

  getLedgers() {
    axios.get(this.url).then((response) => {
      let data = [
        {
          label: "Ledger Close",
          values: [],
        },
      ];
      this.lastLedgerClosedAt = null;
      each(response.data._embedded.records, (ledger) => {
        let closedAt = new Date(ledger.closed_at);
        if (this.lastLedgerClosedAt == null) {
          this.lastLedgerClosedAt = closedAt;
          this.frontLedgerClosedAt = closedAt; // used in onNewLedger
          return;
        }
        let diff = (this.lastLedgerClosedAt - closedAt) / 1000;
        data[0].values.unshift({ x: ledger.sequence.toString(), y: diff });
        this.lastLedgerClosedAt = closedAt;
      });
      this.setState({ loading: false, data });
      // Start listening to events
      this.props.emitter.addListener(
        this.props.newLedgerEventName,
        this.onNewLedger.bind(this),
      );
    });
  }

  onNewLedger(ledger) {
    let closedAt = new Date(ledger.closed_at);
    if (this.frontLedgerClosedAt) {
      let data = clone(this.state.data);
      let diff = (closedAt - this.frontLedgerClosedAt) / 1000;
      data[0].values.push({ x: ledger.sequence.toString(), y: diff });
      if (data[0].values.length > this.props.limit) {
        data[0].values.shift();
      }
      this.setState({ data });
    }

    this.frontLedgerClosedAt = closedAt;
  }

  render() {
    return (
      <div
        ref={(el) => {
          this.panel = el;
        }}
      >
        <Panel>
          <div className="widget-name">
            Last {this.props.limit} ledgers close times: {this.props.network}
            <a href={this.url} target="_blank" className="api-link">
              API
            </a>
          </div>
          {this.state.loading ? (
            "Loading..."
          ) : (
            <D3BarChart
              data={this.state.data}
              width={this.state.chartWidth}
              colorScale={this.colorScale}
              height={this.state.chartHeight}
              margin={{ top: 10, bottom: 8, left: 40, right: 10 }}
            />
          )}
        </Panel>
      </div>
    );
  }
}
