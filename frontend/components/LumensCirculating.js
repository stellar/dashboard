import React from "react";
import AmountWidget from "./AmountWidget";
import BigNumber from "bignumber.js";
import Panel from "muicss/lib/react/panel";
import { circulatingSupply } from "../../common/lumens.js";

export default class LumensCirculating extends AmountWidget {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.updateAmount(), 60 * 60 * 1000);
    this.updateAmount();
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateAmount() {
    circulatingSupply().then((amount) => {
      this.setState({
        amount: amount,
        code: "XLM",
        loading: false,
      });
    });
  }

  renderName() {
    return (
      <div>
        <span>Circulating Supply</span>
        <a href="/api/v2/lumens/" target="_blank" className="api-link">
          API
        </a>
      </div>
    );
  }
}
