import React, { useEffect, useMemo, useState } from "react";
import { TextLink } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useRedux } from "hooks/useRedux";

import { SectionCard } from "components/SectionCard";
import {
  TimeRange,
  VerticalBarChart,
} from "components/charts/VerticalBarChart";
import { LedgerTransactionHistoryFilterType } from "types";
import { fetchAverageTransactionsFeeData } from "ducks/feeStats";

import "./styles.scss";

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

      const amountFees = feeStats.fees.day.length - 1;

      const baseDate = new Date(
        feeStats.fees[rangeInterval as "day" | "month"][amountFees].date,
      );

      return {
        fees: {
          day: formattedFeePerHour,
          month: formattedMonthlyFee,
          baseDate,
        },
      };
    }

    return { fees: { day: [], month: [], baseDate: new Date() } };
  }, [feeStats.fees, rangeInterval]);

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
            data={data.fees[rangeInterval as "day" | "month"]}
            primaryValueName="Transactions"
            timeRange={rangeInterval}
            primaryValueTooltipDescription="stroops"
            primaryValueOnly
            baseStartDate={data.fees.baseDate}
          />
        </div>
      </div>
    </SectionCard>
  );
};
