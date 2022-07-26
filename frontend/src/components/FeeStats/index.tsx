import React, { useCallback, useEffect, useMemo } from "react";
import { Icon, Table } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { get } from "lodash";
import BigNumber from "bignumber.js";

import { useRedux } from "hooks/useRedux";
import { SectionCard } from "components/SectionCard";
import { AmountInfoCard } from "components/AmountInfoCard";
import { fetchFeeStatsDataAction } from "ducks/feeStats";
import "./styles.scss";
import { AverageTransactionFee } from "components/AverageTransactionFee";

export const FeeStats = () => {
  const { feeStats } = useRedux("feeStats");
  const dispatch = useDispatch();

  const labels = [
    { id: "metric", label: "Metric" },
    { id: "value", label: "Value" },
  ];

  const nameMap = [
    { id: "ledger_capacity_usage", name: "Capacity Usage" },
    { id: "max_fee.max", name: "Max Accepted Fee" },
    { id: "max_fee.min", name: "Min Accepted Fee" },
    { id: "max_fee.mode", name: "Mode Accepted Fee" },
    { id: "max_fee.p10", name: "10th Percentile Accepted Fee" },
    { id: "max_fee.p20", name: "20th Percentile Accepted Fee" },
    { id: "max_fee.p30", name: "30th Percentile Accepted Fee" },
    { id: "max_fee.p40", name: "40th Percentile Accepted Fee" },
    { id: "max_fee.p50", name: "50th Percentile Accepted Fee" },
    { id: "max_fee.p60", name: "60th Percentile Accepted Fee" },
    { id: "max_fee.p70", name: "70th Percentile Accepted Fee" },
    { id: "max_fee.p80", name: "80th Percentile Accepted Fee" },
    { id: "max_fee.p90", name: "90th Percentile Accepted Fee" },
    { id: "max_fee.p95", name: "95th Percentile Accepted Fee" },
    { id: "max_fee.p99", name: "99th Percentile Accepted Fee" },
  ];

  const getFeeStats = useCallback(() => {
    dispatch(fetchFeeStatsDataAction());
  }, [dispatch]);

  useEffect(() => {
    getFeeStats();

    const interval = setInterval(() => getFeeStats(), 5 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [getFeeStats]);

  const iconStyle = (value: number) => {
    if (value <= 200) {
      return <Icon.ArrowUp color="green" />;
    } else if (value > 200 && value <= 500) {
      return <Icon.ArrowRight color="orange" />;
    } else if (value > 500 && value <= 1000) {
      return <Icon.ArrowDown color="red" />;
    } else if (value > 1000) {
      return <Icon.ArrowDown color="red" />;
    }

    return <Icon.ArrowRight color="white" />;
  };

  const capacityStyle = (cap: number) => {
    if (cap <= 0.5) {
      return <Icon.ArrowUp color="green" />;
    } else if (cap > 0.5 && cap <= 0.7) {
      return <Icon.ArrowRight color="orange" />;
    } else if (cap > 0.7 && cap <= 0.9) {
      return <Icon.ArrowDown color="red" />;
    } else if (cap > 0.9) {
      return <Icon.ArrowDown color="brown" />;
    }

    return <Icon.ArrowRight color="white" />;
  };

  const renderFee = useCallback(
    (data: { id: string; name: string }) => {
      let feeResult;
      const isCapacityUsage = data.id === "ledger_capacity_usage";
      const value = get(feeStats.data, data.id);

      if (isCapacityUsage) {
        feeResult = `${Math.round(value * 100)}%`;
      } else {
        feeResult = new BigNumber(value).toFormat();
      }

      return (
        <React.Fragment key={data.id}>
          <td className="FeeStats__tableContainer__metric">{data.name}</td>
          <td className="FeeStats__tableContainer__value">
            {feeResult}
            {isCapacityUsage ? capacityStyle(value) : iconStyle(value)}
          </td>
        </React.Fragment>
      );
    },
    [feeStats.data],
  );

  const data = useMemo(() => {
    if (feeStats.fees?.month) {
      const daysInMonth = feeStats.fees.month.length;
      const feesResults = feeStats.fees.month.reduce((acc, currentValue) => {
        acc += Number(currentValue.primaryValue);
        return acc;
      }, 0);

      const baseOperationFee = 0.00001;

      const average = String((feesResults / daysInMonth) * baseOperationFee);

      const formattedAverage = new BigNumber(average).toFormat(5);

      return `${formattedAverage} XLM`;
    }

    return "0 XLM";
  }, [feeStats.fees?.month]);

  return (
    <SectionCard title="Transaction Fee Info:">
      <div className="FeeStats">
        <div className="FeeStats__cardsContainer">
          <AmountInfoCard title="Average Transaction Fee" amount={data} />
          <AmountInfoCard title="Base operation fee" amount="0.00001 XLM" />
          <AmountInfoCard title="Base reserve" amount="0.5 XLM" />
        </div>

        <div className="FeeStats__tableContainer">
          <div className="FeeStats__tableContainer__title">
            Fee Stats (Last 5 ledgers), Fee unit in{" "}
            <a
              className="FeeStats__tableContainer__link"
              href="https://developers.stellar.org/docs/glossary/fees/#base-fee"
              target="_blanck"
            >
              stroops.
            </a>
          </div>

          <Table
            id="fee-stats"
            data={nameMap}
            columnLabels={labels}
            hideNumberColumn
            renderItemRow={renderFee}
          />
        </div>

        <AverageTransactionFee />
      </div>
    </SectionCard>
  );
};
