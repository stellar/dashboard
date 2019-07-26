import React from "react";
import AccountBadge from "./AccountBadge";

export default class AssetLink extends React.Component {
  render() {
    return (
      <span>
        <code>{this.props.code}</code>
        {this.props.issuer ? (
          <AccountBadge
            horizonURL={this.props.horizonURL}
            id={this.props.issuer}
          />
        ) : (
          ""
        )}
      </span>
    );
  }
}
