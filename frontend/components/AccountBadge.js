import React from "react";
import isObject from "lodash/isObject";
import { knownAccounts } from "../common/known_accounts";

export default class AccountBadge extends React.Component {
  render() {
    return (
      <span className="account">
        <code>
          <a
            href={this.props.horizonURL + "/accounts/" + this.props.id}
            target="_blank"
          >
            {this.props.id.substr(0, 4)}
          </a>
        </code>
        {knownAccounts[this.props.id] && this.props.id != this.props.known ? (
          isObject(knownAccounts[this.props.id]) ? (
            <a
              href={knownAccounts[this.props.id].url}
              target="_blank"
              title={knownAccounts[this.props.id].name}
            >
              <img src={knownAccounts[this.props.id].icon} />
            </a>
          ) : (
            <span className="account-tag">{knownAccounts[this.props.id]}</span>
          )
        ) : (
          ""
        )}
      </span>
    );
  }
}
