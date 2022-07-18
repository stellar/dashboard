import React, { useEffect, useMemo, useState } from "react";
import { TextLink } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { useRedux } from "hooks/useRedux";

import "./styles.scss";

import { fetchDexDataAction } from "ducks/dex";
import { SectionCard } from "components/SectionCard";
import {
  TimeRange,
  VerticalBarChart,
} from "components/charts/VerticalBarChart";
import { LedgerTransactionHistoryFilterType } from "types";

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
  const { dex } = useRedux("dex");
  const dispatch = useDispatch();

  const [rangeInterval, setRangeInterval] = useState(TimeRange.DAY);

  useEffect(() => {
    dispatch(fetchDexDataAction());
  }, [dispatch]);

  const data = useMemo(() => {
    if (dex.data) {
      const formattedMonthlyFee = dex.data?.fees.month.map((fee) => ({
        date: new Date(fee.date),
        primaryValue: Number(fee.primaryValue),
      }));

      const formattedFeePerHour = dex.data?.fees.hour.map((fee) => ({
        date: new Date(fee.date),
        primaryValue: Number(fee.primaryValue),
      }));

      return { day: formattedFeePerHour, month: formattedMonthlyFee };
    }

    return { day: [], month: [] };
  }, [dex.data]);

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
      isLoading={dex.status === "PENDING"}
      noData={!data.day}
      titleLinkLabel="API"
      // temp link
      titleLink="http://localhost:3000/api/dex/all"
    >
      <div className="AverageTransactionFee__mainChart">
        <div className="AverageTransactionFee__mainChart__container">
          {dex.data && (
            <VerticalBarChart
              data={data[rangeInterval as "month" | "day"]}
              primaryValueName="Transactions"
              timeRange={rangeInterval}
              primaryValueTooltipDescription="txns"
              primaryValueOnly
            />
          )}
        </div>
      </div>
    </SectionCard>
  );
};
