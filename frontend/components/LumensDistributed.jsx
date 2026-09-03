import React from "react";
import AmountWidget from "./AmountWidget.jsx";
import * as lumens from "../../common/lumens.js";
const { distributionAll } = lumens;

export default class LumensDistributed extends AmountWidget {
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
    distributionAll().then((amount) => {
      this.setState({ amount, code: "XLM", loading: false });
    });
  }

  name() {
    return "Lumens distributed";
  }

  apiUrl() {
    return "/api/lumens";
  }
}
