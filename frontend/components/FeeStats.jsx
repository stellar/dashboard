import React from "react";
import axios from "axios";
import get from "lodash/get";
import Card from "./ui/Card.jsx";
import {
  getChartTheme,
  createTooltip,
  tooltipRow,
} from "./ui/chartUtils.js";

export default class FeeStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, expanded: false, stats: {} };
    this.url = `${this.props.horizonURL}/fee_stats`;
    this.percentiles = [
      "p10",
      "p20",
      "p30",
      "p40",
      "p50",
      "p60",
      "p70",
      "p80",
      "p90",
      "p95",
      "p99",
    ];
    this.nameMap = [
      { id: "ledger_capacity_usage", name: "Capacity usage" },
      { id: "max_fee.max", name: "Max accepted fee" },
      { id: "max_fee.min", name: "Min accepted fee" },
      { id: "max_fee.mode", name: "Mode accepted fee" },
      { id: "max_fee.p10", name: "10th percentile accepted fee" },
      { id: "max_fee.p20", name: "20th percentile accepted fee" },
      { id: "max_fee.p30", name: "30th percentile accepted fee" },
      { id: "max_fee.p40", name: "40th percentile accepted fee" },
      { id: "max_fee.p50", name: "50th percentile accepted fee" },
      { id: "max_fee.p60", name: "60th percentile accepted fee" },
      { id: "max_fee.p70", name: "70th percentile accepted fee" },
      { id: "max_fee.p80", name: "80th percentile accepted fee" },
      { id: "max_fee.p90", name: "90th percentile accepted fee" },
      { id: "max_fee.p95", name: "95th percentile accepted fee" },
      { id: "max_fee.p99", name: "99th percentile accepted fee" },
    ];
  }

  getStats() {
    if (this.statsLoading) {
      return;
    }
    this.statsLoading = true;

    axios.get(this.url).then((response) => {
      this.setState({ loading: false, stats: response.data });
      this.statsLoading = false;
    });
  }

  componentDidMount() {
    this.tooltip = createTooltip();
    this.getStats();
    this.timerID = setInterval(() => this.getStats(), 5 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    this.tooltip.destroy();
  }

  showPercentileTooltip(event, percentile, value) {
    this.tooltip.show(
      `<div style="opacity:.6;margin-bottom:4px;">${percentile} percentile</div>` +
        tooltipRow(
          getChartTheme(event.currentTarget).primary,
          "Accepted fee",
          `${value.toLocaleString("en-US")} stroops`,
        ),
      event.clientX,
      event.clientY,
    );
  }

  capacityClass(cap) {
    if (cap <= 0.7) {
      return "";
    } else if (cap <= 0.9) {
      return "text-warning";
    }
    return "text-danger";
  }

  render() {
    const capacity = get(this.state.stats, "ledger_capacity_usage");
    const pValues = this.percentiles.map((p) => ({
      p,
      value: Number(get(this.state.stats, `max_fee.${p}`)),
    }));
    // Fees span orders of magnitude — log-normalize the mini-chart heights.
    const maxLog = Math.max(...pValues.map((d) => Math.log10(d.value + 1)), 1);

    return (
      <Card title="Fee stats · last 5 ledgers" apiUrl={this.url}>
        {this.state.loading ? (
          <div>
            <span className="skeleton"></span>
            <span className="skeleton" style={{ width: "85%" }}></span>
            <span className="skeleton" style={{ width: "70%" }}></span>
          </div>
        ) : (
          <div>
            <div className="capacity-meter">
              <div className="capacity-meter-head">
                <span className="stat-label">Capacity usage</span>
                <span className={"stat-value " + this.capacityClass(capacity)}>
                  {Math.round(capacity * 100)}%
                </span>
              </div>
              <div className="capacity-meter-track">
                <div
                  className="capacity-meter-fill"
                  style={{
                    width: `${Math.min(Math.round(capacity * 100), 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="fee-summary">
              <div className="stat">
                <div className="stat-label">Min accepted</div>
                <div className="stat-value">
                  {get(this.state.stats, "max_fee.min")}
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Mode</div>
                <div className="stat-value">
                  {get(this.state.stats, "max_fee.mode")}
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Max accepted</div>
                <div className="stat-value">
                  {get(this.state.stats, "max_fee.max")}
                </div>
              </div>
            </div>

            <div className="fee-percentiles">
              <div className="stat-label">Accepted fee by percentile</div>
              <div
                className="fee-percentiles-bars"
                role="img"
                aria-label="Accepted fee by percentile, log scale"
              >
                {pValues.map((d) => (
                  <div
                    key={d.p}
                    className="fee-bar"
                    onMouseMove={(e) =>
                      this.showPercentileTooltip(e, d.p, d.value)
                    }
                    onMouseLeave={() => this.tooltip.hide()}
                  >
                    <div
                      className="fee-bar-fill"
                      style={{
                        height: `${Math.max(
                          (Math.log10(d.value + 1) / maxLog) * 100,
                          4,
                        )}%`,
                      }}
                    ></div>
                    <span className="fee-bar-label">
                      {d.p.replace("p", "")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {this.state.expanded ? (
              <table className="data-table">
                <tbody>
                  {this.nameMap
                    .filter((field) => field.id !== "ledger_capacity_usage")
                    .map((field) => (
                      <tr key={field.id}>
                        <td className="label">{field.name}</td>
                        <td className="num">
                          {get(this.state.stats, field.id)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : null}

            <button
              type="button"
              className="text-button"
              onClick={() => this.setState({ expanded: !this.state.expanded })}
              aria-expanded={this.state.expanded}
            >
              {this.state.expanded ? "Hide full table" : "Show full table"}
            </button>
          </div>
        )}
      </Card>
    );
  }
}
