import React from "react";
import Panel from "muicss/lib/react/panel";
import BigNumber from "bignumber.js";

export default class AmountWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  renderName() {
    return null;
  }

  render() {
    let amountBig;
    let amount;
    if (this.state.loading) {
      amountBig = "Loading...";
    } else {
      if (this.state.amount >= 1000000000) {
        amountBig = Math.floor(this.state.amount / 10000000) / 100 + "B";
      } else if (this.state.amount >= 1000000) {
        amountBig = Math.floor(this.state.amount / 10000) / 100 + "M";
      } else if (this.state.amount < 1000000 && this.state.amount >= 100000) {
        amountBig = Math.floor(this.state.amount / 1000) + "k";
      } else {
        amountBig = Math.floor(this.state.amount);
      }

      if (this.state.code) {
        amountBig += ` ${this.state.code}`;
      }

      amount = new BigNumber(this.state.amount).toFormat(7);
    }

    return (
      <Panel>
        <div className="widget-name">{this.renderName()}</div>
        <div className="mui--text-display3 mui--text-center">{amountBig}</div>
        <div className="mui--text-caption mui--text-center">
          {this.state.loading ? (
            ""
          ) : (
            <span>
              {amount} {this.state.code}
            </span>
          )}
        </div>
      </Panel>
    );
  }
}
