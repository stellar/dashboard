import React from "react";
import AmountWidget from "./AmountWidget";
import { postBurnTotalCoins } from "../../common/lumens.js";

export default class TotalCoins extends AmountWidget {
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
    postBurnTotalCoins(this.props.horizonURL).then((amount) => {
      let code = "XLM";
      this.setState({ amount, code, loading: false });
    });
  }

  renderName() {
    return (
      <div>
        <span>Total Lumens</span>
        <a href="/api/v2/lumens/" target="_blank" className="api-link">
          API
        </a>
      </div>
    );
  }
}
