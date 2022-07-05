import React from "react";
import BigNumber from "bignumber.js";

import { FetchLastOperationsActionResponse } from "types";
import { AssetLink } from "components/AssetLink";
import { AccountBadge } from "components/AccountBadge";
import { LiquidityPoolBadge } from "components/LiquidPoolBadge";

interface OperationTypeColumnProps {
  operation: FetchLastOperationsActionResponse;
  horizonURL: string;
}

export const OperationTypeColumn: React.FC<OperationTypeColumnProps> = ({
  operation,
  horizonURL,
}) => {
  const formatAccount = (
    am: number,
    asset_type: string,
    asset_code: string,
    asset_issuer: string,
  ) => {
    // Strip zeros and `.`
    let amount = new BigNumber(am).toFormat(7).replace(/\.*0+$/, "");
    let code;

    if (asset_type === "native") {
      code = <i>XLM</i>;
    } else {
      code = asset_code;
    }

    return (
      <span>
        {amount}{" "}
        <AssetLink horizonURL={horizonURL} code={code} issuer={asset_issuer} />
      </span>
    );
  };

  if (operation.type === "create_account") {
    return (
      <span>
        {formatAccount(Number(operation.starting_balance), "native", "", "")}
        &raquo;{" "}
        <AccountBadge
          horizonURL={horizonURL}
          id={operation.source_account}
          account={operation.source_account}
        />
      </span>
    );
  }

  if (operation.type === "payment") {
    return (
      <span>
        {formatAccount(
          operation.amount,
          operation.asset_type,
          operation.asset_code,
          operation.asset_issuer,
        )}
        &raquo;{" "}
        <AccountBadge
          horizonURL={horizonURL}
          id={operation.to}
          account={operation.source_account}
        />
      </span>
    );
  }

  if (operation.type === "path_payment_strict_receive") {
    return (
      <span>
        max{" "}
        {formatAccount(
          Number(operation.source_max),
          operation.source_asset_type,
          operation.source_asset_code,
          operation.source_asset_issuer,
        )}{" "}
        &raquo;{" "}
        {formatAccount(
          operation.amount,
          operation.asset_type,
          operation.asset_code,
          operation.asset_issuer,
        )}{" "}
        &raquo;{" "}
        <AccountBadge
          horizonURL={horizonURL}
          id={operation.to}
          account={operation.source_account}
        />
      </span>
    );
  }

  if (operation.type === "path_payment_strict_receive") {
    return (
      <span>
        max{" "}
        {formatAccount(
          Number(operation.source_max),
          operation.source_asset_type,
          operation.source_asset_code,
          operation.source_asset_issuer,
        )}{" "}
        &raquo;{" "}
        {formatAccount(
          operation.amount,
          operation.asset_type,
          operation.asset_code,
          operation.asset_issuer,
        )}{" "}
        &raquo;{" "}
        <AccountBadge
          horizonURL={horizonURL}
          id={operation.to}
          account={operation.source_account}
        />
      </span>
    );
  }

  if (operation.type === "change_trust") {
    if (operation.asset_type === "liquidity_pool_shares") {
      return (
        <span>
          Liquidity pool{" "}
          <LiquidityPoolBadge
            horizonURL={horizonURL}
            id={operation.liquidity_pool_id!}
          />
        </span>
      );
    }

    return (
      <span>
        <AssetLink
          horizonURL={horizonURL}
          code={operation.asset_code}
          issuer={operation.asset_issuer}
        />{" "}
        issued by{" "}
        <AccountBadge
          horizonURL={horizonURL}
          id={operation.asset_issuer}
          account={operation.source_account}
        />
      </span>
    );
  }

  if (operation.type === "allow_trust") {
    return (
      <span>
        {operation.authorize ? "Allowed" : "Disallowed"}{" "}
        <AccountBadge
          horizonURL={horizonURL}
          id={operation.trustor}
          account={operation.source_account}
        />{" "}
        to hold{" "}
        <AssetLink
          horizonURL={horizonURL}
          code={operation.asset_code}
          issuer={operation.asset_issuer}
        />
      </span>
    );
  }

  if (operation.type === "create_passive_sell_offer") {
    let action;

    if (Number(operation.amount) === 0) {
      action = "Remove offer:";
    } else if (operation.offer_id !== 0) {
      action = "Update offer: sell";
    } else {
      action = "Sell";
    }

    return (
      <span>
        {action}{" "}
        {formatAccount(
          operation.amount,
          operation.selling_asset_type,
          operation.selling_asset_code,
          operation.selling_asset_issuer,
        )}{" "}
        for{" "}
        {operation.buying_asset_type === "native" ? (
          <i>XLM</i>
        ) : (
          <AssetLink
            horizonURL={horizonURL}
            code={operation.buying_asset_code}
            issuer={operation.buying_asset_issuer}
          />
        )}
      </span>
    );
  }

  if (operation.type === "account_merge") {
    return (
      <span>
        &raquo;{" "}
        <AccountBadge
          horizonURL={horizonURL}
          id={operation.into!}
          account={""}
        />
      </span>
    );
  }

  if (operation.type === "manage_data") {
    const { name } = operation;
    return (
      <span>
        Key:{" "}
        <code>
          {name && name.length <= 20
            ? operation.name
            : name?.substring(0, 20) + "..."}
        </code>
      </span>
    );
  }

  if (operation.type === "liquidity_pool_deposit") {
    return <span>Shares received: {operation.shares_received}</span>;
  }

  if (operation.type === "liquidity_pool_withdraw") {
    return <span>Shares sold: {operation.shares}</span>;
  }

  return <></>;
};
