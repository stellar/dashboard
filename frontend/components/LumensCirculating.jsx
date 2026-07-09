import React from "react";
import AmountWidget from "./AmountWidget.jsx";
import * as lumens from "../../common/lumens.js";
const { circulatingSupply } = lumens;

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

  name() {
    return "Circulating supply";
  }

  apiUrl() {
    return "/api/v2/lumens/";
  }
}
