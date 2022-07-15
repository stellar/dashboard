import React, { useEffect, useMemo, useState } from "react";
import { TextLink } from "@stellar/design-system";

import { SectionCard } from "components/SectionCard";
import { VerticalBarChart } from "components/charts/VerticalBarChart";
import { LedgerTransactionHistoryFilterType } from "types";

const TIME_RANGE_MAPPING = [
  {
    key: "last24Hours",
    label: LedgerTransactionHistoryFilterType["24H"],
  },
  {
    key: "last30Days",
    label: LedgerTransactionHistoryFilterType["30D"],
  },
];

export const AverageTransactionFee: React.FC = () => {
  const [rangeInterval, setRangeInterval] = useState(
    VerticalBarChart.TimeRange.DAY,
  );

  useEffect(() => {
    setRangeInterval(VerticalBarChart.TimeRange.DAY);
  }, []);

  const timeRangeOptions = useMemo(
    () => (
      <div className="LedgerInfo__titleNav">
        {TIME_RANGE_MAPPING.map((range) => (
          <TextLink
            key={range.key}
            variant={TextLink.variant.secondary}
            onClick={() => console.log("aqui")}
            className={`LedgerInfo__titleNav--${
              rangeInterval === range.key ? "active" : "inactive"
            }`}
          >
            {range.label}
          </TextLink>
        ))}
      </div>
    ),
    [rangeInterval],
  );

  return (
    <SectionCard title="Average Transaction Fee" titleCustom={timeRangeOptions}>
      <div className="LedgerInfo__mainChart">
        <div className="LedgerInfo__mainChart__container">
          <VerticalBarChart
            data={[]}
            primaryValueName="Transactions"
            timeRange={rangeInterval}
            primaryValueTooltipDescription="txns"
            primaryValueOnly
          />
        </div>
      </div>
    </SectionCard>
  );
};
