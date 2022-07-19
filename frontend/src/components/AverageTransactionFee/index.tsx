import React, { useEffect, useMemo, useState } from "react";
import { TextLink } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useRedux } from "hooks/useRedux";

import "./styles.scss";

import { SectionCard } from "components/SectionCard";
import {
  TimeRange,
  VerticalBarChart,
} from "components/charts/VerticalBarChart";
import { LedgerTransactionHistoryFilterType } from "types";
import { fetchAverageTransactionsFeeData } from "ducks/feeStats";

const TIME_RANGE_MAPPING = [
  {
    key: TimeRange.DAY,
    label: LedgerTransactionHistoryFilterType["24H"],
  },
  {
    key: TimeRange.MONTH,
    label: LedgerTransactionHistoryFilterType["30D"],
  },
];

export const AverageTransactionFee: React.FC = () => {
  const { feeStats } = useRedux("feeStats");
  const dispatch = useDispatch();

  const [rangeInterval, setRangeInterval] = useState(TimeRange.DAY);

  useEffect(() => {
    dispatch(fetchAverageTransactionsFeeData());
  }, [dispatch]);

  const data = useMemo(() => {
    if (feeStats.fees) {
      const formattedMonthlyFee = feeStats.fees.month.map((fee) => ({
        date: new Date(fee.date),
        primaryValue: Number(fee.primaryValue),
      }));

      const formattedFeePerHour = feeStats.fees.day.map((fee) => ({
        date: new Date(fee.date),
        primaryValue: Number(fee.primaryValue),
      }));

      return { day: formattedFeePerHour, month: formattedMonthlyFee };
    }

    return { day: [], month: [] };
  }, [feeStats.fees]);

  const timeRangeOptions = useMemo(
    () => (
      <div className="LedgerInfo__titleNav">
        {TIME_RANGE_MAPPING.map((range) => (
          <TextLink
            key={range.key}
            variant={TextLink.variant.secondary}
            onClick={() => setRangeInterval(range.key)}
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
    <SectionCard
      title="Average Transaction Fee"
      titleCustom={timeRangeOptions}
      noData={!feeStats.fees}
    >
      <div className="AverageTransactionFee__mainChart">
        <div className="AverageTransactionFee__mainChart__container">
          <VerticalBarChart
            data={data[rangeInterval as "day" | "month"]}
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
