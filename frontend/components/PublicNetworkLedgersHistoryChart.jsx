import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import * as d3 from "d3";
import D3BarChartNoXLabels from "./D3BarChartNoXLabels.jsx";
import clone from "lodash/clone";
import each from "lodash/each";

export default class PublicNetworkLedgersHistoryChart extends React.Component {
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
            <span style={{ borderBottom: "2px solid #1f77b4" }}>Txs</span> &amp;{" "}
            <span style={{ borderBottom: "2px solid #ff7f0e" }}>Ops</span> in
            the last 30 days: Live Network
          </div>
          {this.state.loading ? (
            "Loading..."
          ) : (
            <D3BarChartNoXLabels
              data={this.state.data}
              width={this.state.chartWidth}
              colorScale={this.colorScale}
              height={this.state.chartHeight}
              margin={{ top: 10, bottom: 8, left: 40, right: 10 }}
              yAxisMax={10000000}
              yAxisStep={1000000}
              tickFormat={d3.format(".1s")}
            />
          )}
        </Panel>
      </div>
    );
  }
}
