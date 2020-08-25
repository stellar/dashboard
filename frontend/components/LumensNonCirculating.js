import React from "react";
import AmountWidget from "./AmountWidget";
import Panel from "muicss/lib/react/panel";
import { noncirculatingSupply } from "../../common/lumens.js";

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

  renderName() {
    return (
      <div>
        <span>Non-Circulating Supply</span>
        <a href="/api/v2/lumens/" target="_blank" className="api-link">
          API
        </a>
      </div>
    );
  }
}
