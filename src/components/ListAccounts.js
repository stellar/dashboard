import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import {clone, find, reduce} from 'lodash';
import AccountLink from './AccountLink';
import BigNumber from 'bignumber.js';

export default class ListAccounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {balances: {}};
    this.loadBalances();
  }

  loadBalances() {
    let balances = {};

    Promise.all(this.props.accounts.map(accountId => { 
      return axios.get(`${this.props.horizonURL}/accounts/${accountId}`)
        .then(response => {
          let xlmBalance = find(response.data.balances, b => b.asset_type == 'native');
          let balance = xlmBalance.balance;
          balances[accountId] = new BigNumber(balance);
        });
    })).then(() => {
      this.setState({balances});
    });
  }

  componentDidMount() {
    // Update balances
    this.timerID = setInterval(() => this.loadBalances(), 60*60*1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  render() {
    let sum = _.reduce(this.state.balances, (sum, balance) => sum.add(balance), new BigNumber(0));

    return (
      <Panel>
        <div className="widget-name">
          List of accounts: {this.props.label}
        </div>
        {
          sum.gt(0) ?
          <table className="mui-table small">
            <thead>
              <tr>
                <th>Account</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(this.state.balances).map(key => { 
                  return <tr key={key}>
                    <td><AccountLink horizonURL={this.props.horizonURL} id={key} /></td>
                    <td className="amount-column">{typeof this.state.balances[key] === "undefined" ? "Loading..." : `${this.state.balances[key].toFormat(0, BigNumber.ROUND_FLOOR)} XLM`}</td>
                  </tr>
                })
              }
            </tbody>
            <tfoot>
              <tr>
                <th>Sum</th>
                <th className="amount-column">{sum.toFormat(0, BigNumber.ROUND_FLOOR)} XLM</th>
              </tr>
            </tfoot>
          </table>
          :
          "Loading..."
        }
      </Panel>
    );
  }
}
