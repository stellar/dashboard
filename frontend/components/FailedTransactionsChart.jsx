import React from "react";
import axios from "axios";
import * as d3 from "d3";
import D3BarChartNoXLabels from "./D3BarChartNoXLabels.jsx";
import clone from "lodash/clone";
import each from "lodash/each";
import Card from "./ui/Card.jsx";

export default class FailedTransactionsChart extends React.Component {
  constructor(props) {
    super(props);
    this.panel = null;
    this.state = {
      loading: true,
      chartWidth: 400,
      chartHeight: this.props.chartHeight || 120,
      yAxisMax: 300, // Default value, will be updated dynamically
      yAxisStep: 100, // Default value, will be updated dynamically
    };
    this.url = `${this.props.horizonURL}/ledgers?order=desc&limit=${this.props.limit}`;
    this.tooltipTitle = (x) => `Ledger #${x}`;
  }

  componentDidMount() {
    this.getLedgers();
    // Update chart width
    this.updateSize();
    this.sizeInterval = setInterval(() => this.updateSize(), 5000);
  }

  componentWillUnmount() {
    clearInterval(this.sizeInterval);
    if (this.newLedgerListener) {
      this.newLedgerListener.remove();
    }
  }

  updateSize() {
    let value = this.panel.offsetWidth - 42;
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
    if (this.props.network === "Testnet") {
      stepSize = 1; // Test network uses step size of 1
    } else {
      // Live network: choose between 50 and 100 based on resulting tick count
      const ticksWith50 = Math.ceil(maxValue / 50);
      stepSize = ticksWith50 <= 10 ? 50 : 100;
    }

    const yAxisMax = Math.ceil(maxValue / stepSize) * stepSize;

    // Ensure minimum values for better chart readability
    let minYAxisMax;
    if (this.props.network === "Testnet") {
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
          label: "Successful",
          values: [],
        },
        {
          label: "Failed",
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
      this.newLedgerListener = this.props.emitter.addListener(
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
        <Card
          title={`Successful & failed txs · last ${this.props.limit} ledgers`}
          apiUrl={this.url}
          tag={
            <div className="legend">
              <span className="legend-item">
                <span className="legend-dot series-a"></span>Successful
              </span>
              <span className="legend-item">
                <span className="legend-dot series-b"></span>Failed
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
              tickFormat={d3.format("d")}
              data={this.state.data}
              width={this.state.chartWidth}
              height={this.state.chartHeight}
              margin={{ top: 10, bottom: 8, left: 40, right: 10 }}
              yAxisMax={this.state.yAxisMax}
              yAxisStep={this.state.yAxisStep}
              tooltipTitle={this.tooltipTitle}
            />
          )}
        </Card>
      </div>
    );
  }
}
