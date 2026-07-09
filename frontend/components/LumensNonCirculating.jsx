import React from "react";
import AmountWidget from "./AmountWidget.jsx";
import * as lumens from "../../common/lumens.js";
const { noncirculatingSupply } = lumens;

export default class LumensNonCirculating extends AmountWidget {
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
    noncirculatingSupply().then((amount) => {
      this.setState({ amount, code: "XLM", loading: false });
    });
  }

  name() {
    return "Non-circulating supply";
  }

  apiUrl() {
    return "/api/v2/lumens/";
  }
}
