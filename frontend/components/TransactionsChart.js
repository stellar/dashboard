import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import { scale, format } from "d3";
import BarChart from "react-d3-components/lib/BarChart";
import clone from "lodash/clone";
import each from "lodash/each";

export default class TransactionsChart extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    this.colorScale = scale.category10();
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
            <span style={{ borderBottom: "2px solid #0074B7" }}>Txs</span> &amp;{" "}
            <span style={{ borderBottom: "2px solid #FF6F00" }}>Ops</span> in
            the last {this.props.limit} ledgers: {this.props.network}
            <a href={this.url} target="_blank" className="api-link">
              API
            </a>
          </div>
          {this.state.loading ? (
            "Loading..."
          ) : (
            <BarChart
              tickFormat={d3.format("d")}
              data={this.state.data}
              width={this.state.chartWidth}
              colorScale={this.colorScale}
              height={this.state.chartHeigth}
              margin={{ top: 10, bottom: 8, left: 50, right: 10 }}
            />
          )}
        </Panel>
      </div>
    );
  }
}
