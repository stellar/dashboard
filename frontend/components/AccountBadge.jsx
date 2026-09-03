import React from "react";
import isObject from "lodash/isObject";
import { knownAccounts } from "../common/known_accounts";

export default class AccountBadge extends React.Component {
  render() {
    const known =
      this.props.id != this.props.known ? knownAccounts[this.props.id] : null;
    const accountUrl = this.props.horizonURL + "/accounts/" + this.props.id;

    // Known entities read by name; the raw key stays one hover away.
    if (known) {
      const name = isObject(known) ? known.name : known;
      return (
        <span className="account">
          <a
            className="account-known"
            href={accountUrl}
            target="_blank"
            rel="noreferrer"
            title={this.props.id}
          >
            {name}
          </a>
        </span>
      );
    }

    return (
      <span className="account">
        <code>
          <a
            href={accountUrl}
            target="_blank"
            rel="noreferrer"
            title={this.props.id}
          >
            {this.props.id.substr(0, 4)}
          </a>
        </code>
      </span>
    );
  }
}
