import React from "react";

interface LiquidityPoolBadgeProps {
  horizonURL: string;
  id: string;
}

export const LiquidityPoolBadge: React.FC<LiquidityPoolBadgeProps> = ({
  horizonURL,
  id,
}) => {
  return (
    <span className="account">
      <code>
        <a
          href={horizonURL + "/liquidity_pools/" + id}
          target="_blank"
          rel="noreferrer"
        >
          {id.substring(0, 4)}
        </a>
      </code>
    </span>
  );
};
