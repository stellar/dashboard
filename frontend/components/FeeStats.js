import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import moment from "moment";
import clone from "lodash/clone";
import each from "lodash/each";
import defaults from "lodash/defaults";
import get from "lodash/get";
import AccountBadge from "./AccountBadge";
import AssetLink from "./AssetLink";
import BigNumber from "bignumber.js";
import { ago } from "../common/time";

export default class FeeStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, stats: {} };
    this.url = `${this.props.horizonURL}/fee_stats`;
    this.nameMap = [
      { id: "ledger_capacity_usage", name: "Capacity Usage" },
      { id: "max_fee.max", name: "Max Accepted Fee" },
      { id: "max_fee.min", name: "Min Accepted Fee" },
      { id: "max_fee.mode", name: "Mode Accepted Fee" },
      { id: "max_fee.p10", name: "10th Percentile Accepted Fee" },
      { id: "max_fee.p20", name: "20th Percentile Accepted Fee" },
      { id: "max_fee.p30", name: "30th Percentile Accepted Fee" },
      { id: "max_fee.p40", name: "40th Percentile Accepted Fee" },
      { id: "max_fee.p50", name: "50th Percentile Accepted Fee" },
      { id: "max_fee.p60", name: "60th Percentile Accepted Fee" },
      { id: "max_fee.p70", name: "70th Percentile Accepted Fee" },
      { id: "max_fee.p80", name: "80th Percentile Accepted Fee" },
      { id: "max_fee.p90", name: "90th Percentile Accepted Fee" },
      { id: "max_fee.p95", name: "95th Percentile Accepted Fee" },
      { id: "max_fee.p99", name: "99th Percentile Accepted Fee" },
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

  capacityStyle(cap) {
    if (cap <= 0.5) {
      return { color: "green" };
    } else if (cap > 0.5 && cap <= 0.7) {
      return { color: "orange" };
    } else if (cap > 0.7 && cap <= 0.9) {
      return { color: "red", fontWeight: "bold" };
    } else if (cap > 0.9) {
      return { color: "brown", fontWeight: "bold" };
    }
  }

  feeStyle(fee) {
    if (fee <= 200) {
      return { color: "green" };
    } else if (fee > 200 && fee <= 500) {
      return { color: "orange" };
    } else if (fee > 500 && fee <= 1000) {
      return { color: "red", fontWeight: "bold" };
    } else if (fee > 1000) {
      return { color: "brown", fontWeight: "bold" };
    }
  }

  render() {
    return (
      <Panel>
        <div className="widget-name">
          Fee stats (last 5 ledgers)
          <a href={this.url} target="_blank" className="api-link">
            API
          </a>
        </div>
        <table className="mui-table small">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {this.state.loading ? (
              <tr>
                <td colSpan="2">Loading...</td>
              </tr>
            ) : (
              this.nameMap.map((field) => {
                let styleFn = this.feeStyle;
                let val = get(this.state.stats, field.id);
                let displayVal = get(this.state.stats, field.id);

                if (field.id === "ledger_capacity_usage") {
                  styleFn = this.capacityStyle;
                  displayVal = `${Math.round(val * 100)}%`;
                }

                return (
                  <tr key={field.id}>
                    <td>{field.name}</td>
                    <td style={styleFn(val)}>{displayVal}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Panel>
    );
  }
}
