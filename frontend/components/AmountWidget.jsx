import React from "react";
import BigNumber from "bignumber.js";
import Card from "./ui/Card.jsx";

export default class AmountWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  // Subclasses override these.
  name() {
    return null;
  }

  apiUrl() {
    return null;
  }

  render() {
    let amountBig;
    let amount;
    if (!this.state.loading) {
      if (this.state.amount >= 1000000000) {
        amountBig = Math.floor(this.state.amount / 10000000) / 100 + "B";
      } else if (this.state.amount >= 1000000) {
        amountBig = Math.floor(this.state.amount / 10000) / 100 + "M";
      } else if (this.state.amount < 1000000 && this.state.amount >= 100000) {
        amountBig = Math.floor(this.state.amount / 1000) + "k";
      } else {
        amountBig = Math.floor(this.state.amount);
      }

      amount = new BigNumber(this.state.amount).toFormat(7);
    }

    return (
      <Card title={this.name()} apiUrl={this.apiUrl()}>
        {this.state.loading ? (
          <div>
            <div className="amount-hero">
              <span className="skeleton" style={{ width: "60%" }}></span>
            </div>
            <div className="amount-precise">
              <span className="skeleton" style={{ width: "40%" }}></span>
            </div>
          </div>
        ) : (
          <div>
            <div className="amount-hero">
              {amountBig}
              <span className="amount-unit">{this.state.code}</span>
            </div>
            <div className="amount-precise">
              {amount} {this.state.code}
            </div>
          </div>
        )}
      </Card>
    );
  }
}
