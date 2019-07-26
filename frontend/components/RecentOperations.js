import React from "react";
import Panel from "muicss/lib/react/panel";
import axios from "axios";
import moment from "moment";
import clone from "lodash/clone";
import each from "lodash/each";
import defaults from "lodash/defaults";
import AccountBadge from "./AccountBadge";
import AssetLink from "./AssetLink";
import BigNumber from "bignumber.js";
import { ago } from "../common/time";

export default class RecentOperations extends React.Component {
  constructor(props) {
    super(props);
    this.props = defaults(props, { limit: 10 });
    this.state = { loading: true, operations: [] };

    this.url = `${this.props.horizonURL}/operations`;
    if (this.props.account) {
      this.url = `${this.props.horizonURL}/accounts/${this.props.account}/operations`;
    }
    this.url = `${this.url}?order=desc&limit=${this.props.limit}`;
  }

  getRecentOperations() {
    if (this.operationsLoading) {
      return;
    }
    this.operationsLoading = true;

    axios.get(this.url).then((response) => {
      let records = response.data._embedded.records;
      let operations = [];
      each(records, (operation) => {
        operation.createdAtMoment = moment(operation.created_at);
        operation.ago = ago(operation.createdAtMoment);
        operations.push(operation);
      });
      this.setState({ operations });
      this.operationsLoading = false;
    });
  }

  componentDidMount() {
    this.getRecentOperations();
    this.timerID = setInterval(() => this.getRecentOperations(), 10 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  amount(am, asset_type, asset_code, asset_issuer) {
    // Strip zeros and `.`
    let amount = new BigNumber(am).toFormat(7).replace(/\.*0+$/, "");
    let code;
    if (asset_type == "native") {
      code = <i>XLM</i>;
    } else {
      code = asset_code;
    }

    return (
      <span>
        {amount}{" "}
        <AssetLink
          horizonURL={this.props.horizonURL}
          code={code}
          issuer={asset_issuer}
        />
      </span>
    );
  }

  operationTypeColRender(op) {
    switch (op.type) {
      case "create_account":
        return (
          <span>
            {this.amount(op.starting_balance, "native")} &raquo;{" "}
            <AccountBadge
              horizonURL={this.props.horizonURL}
              id={op.account}
              known={this.props.account}
            />
          </span>
        );
      case "payment":
        return (
          <span>
            {this.amount(
              op.amount,
              op.asset_type,
              op.asset_code,
              op.asset_issuer,
            )}{" "}
            &raquo;{" "}
            <AccountBadge
              horizonURL={this.props.horizonURL}
              id={op.to}
              known={this.props.account}
            />
          </span>
        );
      case "path_payment":
        return (
          <span>
            max{" "}
            {this.amount(
              op.source_max,
              op.source_asset_type,
              op.source_asset_code,
              op.source_asset_issuer,
            )}{" "}
            &raquo;{" "}
            {this.amount(
              op.amount,
              op.asset_type,
              op.asset_code,
              op.asset_issuer,
            )}{" "}
            &raquo;{" "}
            <AccountBadge
              horizonURL={this.props.horizonURL}
              id={op.to}
              known={this.props.account}
            />
          </span>
        );
      case "change_trust":
        return (
          <span>
            <AssetLink
              horizonURL={this.props.horizonURL}
              code={op.asset_code}
              issuer={op.asset_issuer}
            />{" "}
            issued by{" "}
            <AccountBadge
              horizonURL={this.props.horizonURL}
              id={op.asset_issuer}
              known={this.props.account}
            />
          </span>
        );
      case "allow_trust":
        return (
          <span>
            {op.authorize ? "Allowed" : "Disallowed"}{" "}
            <AccountBadge
              horizonURL={this.props.horizonURL}
              id={op.trustor}
              known={this.props.account}
            />{" "}
            to hold{" "}
            <AssetLink
              horizonURL={this.props.horizonURL}
              code={op.asset_code}
              issuer={op.asset_issuer}
            />
          </span>
        );
      case "manage_offer":
      case "create_passive_offer":
        let action;

        if (op.amount == 0) {
          action = "Remove offer:";
        } else if (op.offer_id != 0) {
          action = "Update offer: sell";
        } else {
          action = "Sell";
        }

        return (
          <span>
            {action}{" "}
            {this.amount(
              op.amount,
              op.selling_asset_type,
              op.selling_asset_code,
              op.selling_asset_issuer,
            )}{" "}
            for{" "}
            {op.buying_asset_type == "native" ? (
              <i>XLM</i>
            ) : (
              <AssetLink
                horizonURL={this.props.horizonURL}
                code={op.buying_asset_code}
                issuer={op.buying_asset_issuer}
              />
            )}
          </span>
        );
      case "account_merge":
        return (
          <span>
            &raquo;{" "}
            <AccountBadge horizonURL={this.props.horizonURL} id={op.into} />
          </span>
        );
      case "manage_data":
        return (
          <span>
            Key:{" "}
            <code>
              {op.name.length <= 20 ? op.name : op.name.substr(0, 20) + "..."}
            </code>
          </span>
        );
    }
  }

  render() {
    return (
      <Panel>
        <div className="widget-name">
          Recent operations: {this.props.label}{" "}
          {this.props.account ? this.props.account.substr(0, 4) : ""}
          <a href={this.url} target="_blank" className="api-link">
            API
          </a>
        </div>
        <table className="mui-table small">
          <thead>
            <tr>
              <th>Source</th>
              <th>Operation</th>
              <th>Details</th>
              <th>Time ago</th>
            </tr>
          </thead>
          <tbody>
            {this.state.operations.map((op) => {
              return (
                <tr key={op.id}>
                  <td>
                    <AccountBadge
                      horizonURL={this.props.horizonURL}
                      id={op.source_account}
                      known={this.props.account}
                    />
                  </td>
                  <td>
                    <a href={op._links.self.href} target="_blank">
                      {op.type == "create_passive_offer"
                        ? "passive_offer"
                        : op.type}
                    </a>
                  </td>
                  <td>{this.operationTypeColRender(op)}</td>
                  <td>
                    {op.ago ? (
                      <span title={op.createdAtMoment.format()}>{op.ago}</span>
                    ) : (
                      "..."
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    );
  }
}
