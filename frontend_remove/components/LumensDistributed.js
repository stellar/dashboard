import React from "react";
import AmountWidget from "./AmountWidget";
import Panel from "muicss/lib/react/panel";
import BigNumber from "bignumber.js";
import axios from "axios";
import find from "lodash/find";
import { distributionAll } from "../../common/lumens.js";

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

  renderName() {
    return (
      <div>
        <span>Lumens Distributed</span>
        <a href="/api/lumens" target="_blank" className="api-link">
          API
        </a>
      </div>
    );
  }
}
