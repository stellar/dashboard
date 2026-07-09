import React from "react";
import axios from "axios";
import D3BarChart from "./D3BarChart.jsx";
import each from "lodash/each";
import clone from "lodash/clone";
import Card from "./ui/Card.jsx";

export default class LedgerChartClose extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    this.state = {
      loading: true,
      chartWidth: 400,
      chartHeight: this.props.chartHeight || 120,
    };
    this.url = `${this.props.horizonURL}/ledgers?order=desc&limit=${this.props.limit}`;
    this.tooltipTitle = (x) => `Ledger #${x}`;
    this.valueFormat = (y) => `${Math.round(y * 100) / 100}s`;
  }

  componentDidMount() {
    this.getLedgers();
    // Update chart width
    this.updateSize();
    setInterval(() => this.updateSize(), 5000);
  }

  updateSize() {
    let value = this.panel.offsetWidth - 42;
    if (this.state.chartWidth != value) {
      this.setState({ chartWidth: value });
    }
  }

  getLedgers() {
    axios.get(this.url).then((response) => {
      let data = [
        {
          label: "Close time",
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
        <Card
          title={`Ledger close times · last ${this.props.limit}`}
          apiUrl={this.url}
        >
          {this.state.loading ? (
            <div
              className="skeleton"
              style={{ height: this.state.chartHeight }}
            ></div>
          ) : (
            <D3BarChart
              data={this.state.data}
              width={this.state.chartWidth}
              height={this.state.chartHeight}
              margin={{ top: 10, bottom: 8, left: 40, right: 10 }}
              tooltipTitle={this.tooltipTitle}
              valueFormat={this.valueFormat}
            />
          )}
        </Card>
      </div>
    );
  }
}
