import React from "react";
import AmountWidget from "./AmountWidget";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import find from "lodash/find";

export default class AccountBalance extends AmountWidget {
  constructor(props) {
    super(props);
    this.url = `${this.props.horizonURL}/accounts/${this.props.id}`;
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.updateBalance(), 5 * 60 * 1000);
    this.updateBalance();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateBalance() {
    axios.get(this.url).then((response) => {
      let xlmBalance = find(
        response.data.balances,
        (b) => b.asset_type == "native",
      );
      let amount = xlmBalance.balance;
      let code = "XLM";
      this.setState({ amount, code, loading: false });
    });
  }

  renderName() {
    return (
      <span>
        {this.props.name}:{" "}
        <code>
          <a href={this.url} target="_blank">
            {this.props.id.substr(0, 4)}
          </a>
        </code>
      </span>
    );
  }
}
