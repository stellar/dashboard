import React from "react";

export default class LiquidityPoolBadge extends React.Component {
  render() {
    return (
      <span className="account">
        <code>
          <a
            href={this.props.horizonURL + "/liquidity_pools/" + this.props.id}
            target="_blank"
          >
            {this.props.id.substr(0, 4)}
          </a>
        </code>
      </span>
    );
  }
}
