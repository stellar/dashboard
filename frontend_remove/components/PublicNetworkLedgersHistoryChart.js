import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import { scale, format } from "d3";
import BarChart from "react-d3-components/lib/BarChart";
import clone from "lodash/clone";
import each from "lodash/each";

export default class PublicNetworkLedgersHistoryChart extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    this.colorScale = scale.category10();
    this.state = {
      loading: true,
      chartWidth: 400,
      chartHeight: this.props.chartHeight || 120,
    };
  }

  componentDidMount() {
    this.getLedgers();
    setInterval(() => this.getLedgers(), 1000 * 60 * 5);
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
    axios.get("/api/ledgers/public").then((response) => {
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
      each(response.data, (day) => {
        data[0].values.unshift({ x: day.date, y: day.transaction_count });
        data[1].values.unshift({ x: day.date, y: day.operation_count });
      });
      this.setState({ loading: false, data });
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
            <span style={{ borderBottom: "2px solid #0074B7" }}>Txs</span> &amp;{" "}
            <span style={{ borderBottom: "2px solid #FF6F00" }}>Ops</span> in
            the last 30 days: Live Network
          </div>
          {this.state.loading ? (
            "Loading..."
          ) : (
            <BarChart
              groupedBars
              data={this.state.data}
              width={this.state.chartWidth}
              colorScale={this.colorScale}
              height={this.state.chartHeight}
              margin={{ top: 10, bottom: 28, left: 50, right: 10 }}
            />
          )}
        </Panel>
      </div>
    );
  }
}
