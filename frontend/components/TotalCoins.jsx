import React from "react";
import AmountWidget from "./AmountWidget.jsx";
import * as lumens from "../../common/lumens.js";
const { totalSupply } = lumens;

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
    totalSupply().then((amount) => {
      let code = "XLM";
      this.setState({ amount, code, loading: false });
    });
  }

  name() {
    return "Total supply";
  }

  apiUrl() {
    return "/api/v2/lumens/";
  }
}
