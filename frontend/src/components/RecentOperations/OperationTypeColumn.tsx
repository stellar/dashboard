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

interface FormatAccountProps {
  amount: string | undefined;
  assetType: string;
  assetCode?: string;
  assetIssuer?: string;
}

export const OperationTypeColumn: React.FC<OperationTypeColumnProps> = ({
  operation,
  horizonURL,
}) => {
  const formatAmount = ({
    amount,
    assetType,
    assetCode,
    assetIssuer,
  }: FormatAccountProps) => {
    // Strip zeros and `.`

    if (!amount) {
      return <></>;
    }

    let formattedAccount = new BigNumber(amount)
      .toFormat(7)
      .replace(/\.*0+$/, "");
    let code;

    if (assetType === "native") {
      code = <i>XLM</i>;
    } else if (!assetType) {
      code = "";
    } else {
      code = assetCode;
    }

    return (
      <span>
        {formattedAccount}{" "}
        <AssetLink
          horizonURL={horizonURL}
          code={code}
          issuer={assetIssuer || ""}
        />
      </span>
    );
  };

  switch (operation.type) {
    case "create_account":
      return (
        <span>
          {formatAmount({
            amount: operation.starting_balance,
            assetType: "native",
          })}
          &raquo;{" "}
          <AccountBadge horizonURL={horizonURL} id={operation.source_account} />
        </span>
      );

    case "payment":
      return (
        <span>
          {formatAmount({
            amount: operation.amount,
            assetType: operation.asset_type,
            assetCode: operation.asset_code,
            assetIssuer: operation.asset_issuer,
          })}
          &raquo; <AccountBadge horizonURL={horizonURL} id={operation.to} />
        </span>
      );

    case "path_payment_strict_receive":
      return (
        <span>
          max{" "}
          {formatAmount({
            amount: operation.source_max,
            assetType: operation.source_asset_type,
            assetCode: operation.source_asset_code,
            assetIssuer: operation.source_asset_issuer,
          })}{" "}
          &raquo;{" "}
          {formatAmount({
            amount: operation.amount,
            assetType: operation.asset_type,
            assetCode: operation.asset_code,
            assetIssuer: operation.asset_issuer,
          })}{" "}
          &raquo; <AccountBadge horizonURL={horizonURL} id={operation.to} />
        </span>
      );

    case "change_trust":
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
          <AccountBadge horizonURL={horizonURL} id={operation.asset_issuer} />
        </span>
      );

    case "allow_trust":
      return (
        <span>
          {operation.authorize ? "Allowed" : "Disallowed"}{" "}
          <AccountBadge horizonURL={horizonURL} id={operation.trustor} /> to
          hold{" "}
          <AssetLink
            horizonURL={horizonURL}
            code={operation.asset_code}
            issuer={operation.asset_issuer}
          />
        </span>
      );

    case "create_passive_sell_offer":
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
          {formatAmount({
            amount: operation.amount,
            assetType: operation.selling_asset_type,
            assetCode: operation.selling_asset_code,
            assetIssuer: operation.selling_asset_issuer,
          })}{" "}
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

    case "account_merge":
      return (
        <span>
          &raquo; <AccountBadge horizonURL={horizonURL} id={operation.into!} />
        </span>
      );

    case "manage_data":
      const { name } = operation;
      return name ? (
        <span>
          Key: <code>{name.substring(0, 20) + "..."}</code>
        </span>
      ) : (
        <></>
      );

    case "liquidity_pool_deposit":
      return <span>Shares received: {operation.shares_received}</span>;

    case "liquidity_pool_withdraw":
      return <span>Shares sold: {operation.shares}</span>;

    default:
      return <></>;
  }
};
