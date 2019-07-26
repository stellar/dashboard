import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import moment from "moment";
import clone from "lodash/clone";
import each from "lodash/each";
import defaults from "lodash/defaults";
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
      { id: "min_accepted_fee", name: "Min Accepted Fee" },
      { id: "mode_accepted_fee", name: "Mode Accepted Fee" },
      { id: "p10_accepted_fee", name: "10th Percentile Accepted Fee" },
      { id: "p20_accepted_fee", name: "20th Percentile Accepted Fee" },
      { id: "p30_accepted_fee", name: "30th Percentile Accepted Fee" },
      { id: "p40_accepted_fee", name: "40th Percentile Accepted Fee" },
      { id: "p50_accepted_fee", name: "50th Percentile Accepted Fee" },
      { id: "p60_accepted_fee", name: "60th Percentile Accepted Fee" },
      { id: "p70_accepted_fee", name: "70th Percentile Accepted Fee" },
      { id: "p80_accepted_fee", name: "80th Percentile Accepted Fee" },
      { id: "p90_accepted_fee", name: "90th Percentile Accepted Fee" },
      { id: "p95_accepted_fee", name: "95th Percentile Accepted Fee" },
      { id: "p99_accepted_fee", name: "99th Percentile Accepted Fee" },
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
                let val = this.state.stats[field.id];
                let displayVal = this.state.stats[field.id];
                if (field.id == "ledger_capacity_usage") {
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
