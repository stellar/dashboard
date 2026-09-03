import React from "react";
import axios from "axios";
import find from "lodash/find";
import reduce from "lodash/reduce";
import AccountBadge from "./AccountBadge.jsx";
import BigNumber from "bignumber.js";
import Card from "./ui/Card.jsx";

export default class ListAccounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { balances: {} };
  }

  loadBalances() {
    let balances = {};

    Promise.all(
      this.props.accounts.map((accountId) => {
        return axios
          .get(`${this.props.horizonURL}/accounts/${accountId}`)
          .then((response) => {
            let xlmBalance = find(
              response.data.balances,
              (b) => b.asset_type == "native",
            );
            let balance = xlmBalance.balance;
            balances[accountId] = new BigNumber(balance);
          });
      }),
    ).then(() => {
      this.setState({ balances });
    });
  }

  componentDidMount() {
    // Update balances
    this.timerID = setInterval(() => this.loadBalances(), 60 * 60 * 1000);
    this.loadBalances();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    let sum = reduce(
      this.state.balances,
      (acc, balance) => acc.add(balance),
      new BigNumber(0),
    );

    return (
      <Card title={`List of accounts · ${this.props.label}`}>
        {sum.gt(0) ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="num">Balance</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.state.balances).map((key) => {
                return (
                  <tr key={key}>
                    <td>
                      <AccountBadge
                        horizonURL={this.props.horizonURL}
                        id={key}
                      />
                    </td>
                    <td className="num">
                      {typeof this.state.balances[key] === "undefined"
                        ? "—"
                        : `${this.state.balances[key].toFormat(
                            0,
                            BigNumber.ROUND_FLOOR,
                          )} XLM`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th>Sum</th>
                <th className="num">
                  {sum.toFormat(0, BigNumber.ROUND_FLOOR)} XLM
                </th>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div>
            <span className="skeleton"></span>
            <span className="skeleton" style={{ width: "80%" }}></span>
          </div>
        )}
      </Card>
    );
  }
}
