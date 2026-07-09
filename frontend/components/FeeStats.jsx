import React from "react";
import axios from "axios";
import get from "lodash/get";
import Card from "./ui/Card.jsx";

export default class FeeStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, stats: {} };
    this.url = `${this.props.horizonURL}/fee_stats`;
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
    this.getStats();
    this.timerID = setInterval(() => this.getStats(), 5 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
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
                <span
                  className={"stat-value " + this.capacityClass(capacity)}
                >
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
          </div>
        )}
      </Card>
    );
  }
}
