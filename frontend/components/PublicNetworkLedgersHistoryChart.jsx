import React from "react";
import axios from "axios";
import * as d3 from "d3";
import D3BarChartNoXLabels from "./D3BarChartNoXLabels.jsx";
import each from "lodash/each";
import Card from "./ui/Card.jsx";

export default class PublicNetworkLedgersHistoryChart extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
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
    let value = this.panel.offsetWidth - 42;
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
        <Card
          title="Txs & ops · last 30 days"
          apiUrl="/api/ledgers/public"
          tag={
            <div className="legend">
              <span className="legend-item">
                <span className="legend-dot series-a"></span>Txs
              </span>
              <span className="legend-item">
                <span className="legend-dot series-b"></span>Ops
              </span>
            </div>
          }
        >
          {this.state.loading ? (
            <div
              className="skeleton"
              style={{ height: this.state.chartHeight }}
            ></div>
          ) : (
            <D3BarChartNoXLabels
              data={this.state.data}
              width={this.state.chartWidth}
              height={this.state.chartHeight}
              margin={{ top: 10, bottom: 26, left: 40, right: 10 }}
              yAxisMax={10000000}
              yAxisStep={1000000}
              tickFormat={d3.format(".1s")}
              xLabelEvery={5}
            />
          )}
        </Card>
      </div>
    );
  }
}
