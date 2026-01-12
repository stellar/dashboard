import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import * as d3 from "d3";
import D3BarChartNoXLabels from "./D3BarChartNoXLabels.jsx";
import clone from "lodash/clone";
import each from "lodash/each";

export default class FailedTransactionsChart extends React.Component {
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
      yAxisMax: 300, // Default value, will be updated dynamically
      yAxisStep: 100, // Default value, will be updated dynamically
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

  calculateDynamicYAxisParams(data) {
    // For stacked charts, we need to find the maximum combined value
    let maxValue = 0;

    if (data.length === 2) {
      // For stacked data, calculate the sum of both series at each point
      const xValues = data[0].values.map((d) => d.x);

      xValues.forEach((x, index) => {
        const bottomValue = data[0].values[index].y;
        const topValue = data[1].values[index].y;
        const combinedValue = bottomValue + topValue;

        if (combinedValue > maxValue) {
          maxValue = combinedValue;
        }
      });
    } else {
      // Fallback for non-stacked charts
      data.forEach((series) => {
        series.values.forEach((point) => {
          if (point.y > maxValue) {
            maxValue = point.y;
          }
        });
      });
    }

    // Determine step size based on network type
    let stepSize;
    if (this.props.network === "Test network") {
      stepSize = 1; // Test network uses step size of 1
    } else {
      // Live network: choose between 50 and 100 based on resulting tick count
      const ticksWith50 = Math.ceil(maxValue / 50);
      stepSize = ticksWith50 <= 10 ? 50 : 100;
    }

    const yAxisMax = Math.ceil(maxValue / stepSize) * stepSize;

    // Ensure minimum values for better chart readability
    let minYAxisMax;
    if (this.props.network === "Test network") {
      minYAxisMax = 10; // Smaller minimum for test network
    } else {
      minYAxisMax = stepSize === 50 ? 100 : 200;
    }

    return {
      yAxisMax: Math.max(yAxisMax, minYAxisMax),
      yAxisStep: stepSize,
    };
  }

  onNewLedger(ledger) {
    let data = clone(this.state.data);
    data[0].values.push({
      x: ledger.sequence.toString(),
      y: ledger.successful_transaction_count,
    });
    data[1].values.push({
      x: ledger.sequence.toString(),
      y: ledger.failed_transaction_count,
    });
    data[0].values.shift();
    data[1].values.shift();

    // Calculate dynamic yAxisMax and yAxisStep based on data
    const { yAxisMax, yAxisStep } = this.calculateDynamicYAxisParams(data);

    this.setState({ loading: false, data, yAxisMax, yAxisStep });
  }

  getLedgers() {
    axios.get(this.url).then((response) => {
      let data = [
        {
          label: "Success",
          values: [],
        },
        {
          label: "Fail",
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
          y: ledger.failed_transaction_count,
        });
      });

      // Calculate dynamic yAxisMax and yAxisStep based on data
      const { yAxisMax, yAxisStep } = this.calculateDynamicYAxisParams(data);

      this.setState({ loading: false, data, yAxisMax, yAxisStep });
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
            <span style={{ borderBottom: "2px solid #1f77b4" }}>
              Successful
            </span>{" "}
            &amp;{" "}
            <span style={{ borderBottom: "2px solid #ff7f0e" }}>Failed</span>{" "}
            Txs in the last {this.props.limit} ledgers: {this.props.network}
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
              height={this.state.chartHeight}
              margin={{ top: 10, bottom: 8, left: 40, right: 10 }}
              yAxisMax={this.state.yAxisMax}
              yAxisStep={this.state.yAxisStep}
            />
          )}
        </Panel>
      </div>
    );
  }
}
