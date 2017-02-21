import React from 'react';
import Panel from 'muicss/lib/react/panel';
import axios from 'axios';
import {find} from 'lodash';

export default class AccountBalance extends React.Component {
  constructor(props) {
    super(props);
    this.url = `${this.props.horizonURL}/accounts/${this.props.id}`;
    this.state = {loading: true};
    this.updateBalance();
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.updateBalance(),
      5*60*1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateBalance() {
    axios.get(this.url)
      .then(response => {
        let xlmBalance = find(response.data.balances, b => b.asset_type == 'native');
        let balance = xlmBalance.balance;
        this.setState({balance, loading: false});
      });
  }

  render() {
    let balance;
    if (this.state.loading) {
      balance = "Loading..."
    } else {
      if (this.state.balance >= 1000000000) {
        balance = Math.floor(this.state.balance / 1000000000)+"B";
      } else if (this.state.balance >= 1000000) {
        balance = Math.round(this.state.balance / 10000)/100+"M";
      } else if (this.state.balance < 1000000 && this.state.balance >= 100000) {
        balance = Math.floor(this.state.balance / 1000)+"k";
      } else {
        balance = Math.floor(this.state.balance);
      }

      balance += " XLM";
    }

    return (
      <Panel>
        <div className="widget-name">
          {this.props.name}: <a href={this.url} target="_blank">{this.props.id.substr(0, 10)}</a>
        </div>
        <div className="mui--text-display3 mui--text-center">
          {balance}
        </div>
      </Panel>
    );
  }
}
