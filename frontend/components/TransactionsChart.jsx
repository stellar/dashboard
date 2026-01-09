import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import * as d3 from "d3";
import D3BarChartNoXLabels from "./D3BarChartNoXLabels.jsx";
import clone from "lodash/clone";
import each from "lodash/each";

export default class TransactionsChart extends React.Component {
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
      chartHeigth: this.props.chartHeigth || 120,
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

  onNewLedger(ledger) {
    let data = clone(this.state.data);
    data[0].values.push({
      x: ledger.sequence.toString(),
      y: ledger.successful_transaction_count,
    });
    data[1].values.push({
      x: ledger.sequence.toString(),
      y: ledger.operation_count - ledger.successful_transaction_count,
    });
    data[0].values.shift();
    data[1].values.shift();
    this.setState({ loading: false, data });
  }

  getLedgers() {
    axios.get(this.url).then((response) => {
      let data = [
        {
          label: "Transactions",
          values: [],
        },
        {
          label: "Operations",
          values: [],
        },
      ];
      each(response.data._embedded.records, (ledger) => {
        data[0].values.unshift({
          x: ledger.sequence.toString(),
          y: ledger.successful_transaction_count,
        });
        data[1].values.unshift({
          x: ledger.sequence.toString(),
          y: ledger.operation_count - ledger.successful_transaction_count,
        });
      });
      this.setState({ loading: false, data });
      // Start listening to events
      this.props.emitter.addListener(
        this.props.newLedgerEventName,
        this.onNewLedger.bind(this),
      );
    });
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
            Successful{" "}
            <span style={{ borderBottom: "2px solid #1f77b4" }}>Txs</span> &amp;{" "}
            <span style={{ borderBottom: "2px solid #ff7f0e" }}>Ops</span> in
            the last {this.props.limit} ledgers: {this.props.network}
            <a href={this.url} target="_blank" className="api-link">
              API
            </a>
          </div>
          {this.state.loading ? (
            "Loading..."
          ) : (
            <D3BarChartNoXLabels
              tickFormat={d3.format("d")}
              data={this.state.data}
              width={this.state.chartWidth}
              colorScale={this.colorScale}
              height={this.state.chartHeigth}
              margin={{ top: 10, bottom: 8, left: 40, right: 10 }}
              yAxisMax={450}
              yAxisStep={50}
            />
          )}
        </Panel>
      </div>
    );
  }
}
