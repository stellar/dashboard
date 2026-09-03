import React from "react";
import axios from "axios";
import BigNumber from "bignumber.js";
import Card from "./ui/Card.jsx";
import { createTooltip, tooltipRow } from "./ui/chartUtils.js";

// Segment colors validated (CVD/contrast, dark & light) with the segment
// order below — order and color travel together.
const SEGMENTS = [
  { key: "circulating", label: "Circulating", color: "#b8860b" },
  { key: "directDevelopment", label: "Direct development", color: "#00a7b5" },
  {
    key: "productAndInnovation",
    label: "Product & innovation",
    color: "#be6a8a",
  },
  { key: "growth", label: "Growth", color: "#8f7fd6" },
  { key: "assetsAndLiquidity", label: "Assets & liquidity", color: "#5e9732" },
  { key: "other", label: "Other non-circulating", color: "#6e6e6e" },
];

function formatBillions(value) {
  return `${new BigNumber(value).div(1e9).toFormat(2)}B`;
}

export default class SupplyDistribution extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount() {
    this.tooltip = createTooltip();
    this.timerID = setInterval(() => this.loadSupply(), 60 * 60 * 1000);
    this.loadSupply();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    this.tooltip.destroy();
  }

  showSegmentTooltip(event, segment, value, pct) {
    this.tooltip.show(
      `<div style="opacity:.6;margin-bottom:4px;">${segment.label}</div>` +
        tooltipRow(
          segment.color,
          "XLM",
          `${formatBillions(value)} · ${pct.toFixed(1)}%`,
        ),
      event.clientX,
      event.clientY,
    );
  }

  loadSupply() {
    axios.get("/api/lumens").then((response) => {
      const { totalCoins, availableCoins, programs } = response.data;
      const total = new BigNumber(totalCoins);
      const circulating = new BigNumber(availableCoins);
      const programValues = {
        directDevelopment: new BigNumber(programs.directDevelopment),
        productAndInnovation: new BigNumber(programs.productAndInnovation),
        growth: new BigNumber(programs.growth),
        assetsAndLiquidity: new BigNumber(programs.assetsAndLiquidity),
      };
      const accounted = Object.values(programValues).reduce(
        (sum, v) => sum.plus(v),
        circulating,
      );
      const other = BigNumber.max(total.minus(accounted), 0);

      this.setState({
        loading: false,
        total,
        values: { circulating, ...programValues, other },
      });
    });
  }

  render() {
    return (
      <Card title="Supply distribution" apiUrl="/api/lumens">
        {this.state.loading ? (
          <div className="skeleton" style={{ height: 48 }}></div>
        ) : (
          <div>
            <div
              className="supply-bar"
              role="img"
              aria-label={`Distribution of the ${formatBillions(
                this.state.total,
              )} XLM total supply`}
            >
              {SEGMENTS.map((segment) => {
                const value = this.state.values[segment.key];
                const pct = value.div(this.state.total).times(100).toNumber();
                return (
                  <div
                    key={segment.key}
                    className="supply-segment"
                    style={{ width: `${pct}%`, background: segment.color }}
                    onMouseMove={(e) =>
                      this.showSegmentTooltip(e, segment, value, pct)
                    }
                    onMouseLeave={() => this.tooltip.hide()}
                  ></div>
                );
              })}
            </div>
            <div className="supply-legend">
              {SEGMENTS.map((segment) => {
                const value = this.state.values[segment.key];
                const pct = value.div(this.state.total).times(100).toNumber();
                return (
                  <div key={segment.key} className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: segment.color }}
                    ></span>
                    <span>{segment.label}</span>
                    <span className="supply-legend-value">
                      {formatBillions(value)} · {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    );
  }
}
