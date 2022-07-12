import React, { ReactNode } from "react";
import { AccountBadge } from "./AccountBadge";

interface AssetsLinkProps {
  code: ReactNode;
  horizonURL: string;
  issuer: string;
}

export const AssetLink: React.FC<AssetsLinkProps> = ({
  code,
  horizonURL,
  issuer,
}) => {
  return (
    <span>
      <code>{code}</code>
      {issuer && <AccountBadge horizonURL={horizonURL} id={issuer} />}
    </span>
  );
};
