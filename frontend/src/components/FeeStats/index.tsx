import React, { useCallback, useEffect } from "react";
import { Icon, Table } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import { get } from "lodash";
import BigNumber from "bignumber.js";

import { useRedux } from "hooks/useRedux";
import { SectionCard } from "components/SectionCard";
import { fetchFeeStatsDataAction } from "ducks/feeStats";
import "./styles.scss";

export const FeeStats = () => {
  const { feeStats } = useRedux("feeStats");
  const dispatch = useDispatch();

  const labels = [
    { id: "metric", label: "Metric" },
    { id: "value", label: "value" },
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
    setInterval(() => getFeeStats(), 5 * 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const renderFee = (data: { id: string; name: string }) => {
    let feeResult;
    const isCapacityUsage = data.id === "ledger_capacity_usage";
    const value = get(feeStats.data, data.id);

    if (isCapacityUsage) {
      feeResult = `${Math.round(value * 100)}%`;
    } else {
      const formattedValue = new BigNumber(value).toFormat();
      feeResult = formattedValue;
    }

    return (
      <React.Fragment key={data.id}>
        <td className="FeeStats__metric">{data.name}</td>
        <td className="FeeStats__value">
          {feeResult}
          {isCapacityUsage ? capacityStyle(value) : iconStyle(value)}
        </td>
      </React.Fragment>
    );
  };

  return (
    <SectionCard title="Fee Stats (Last 5 ledgers), Fee unit in stroops.">
      <div className="FeeStats">
        <Table
          id="fee-stats"
          data={nameMap}
          columnLabels={labels}
          hideNumberColumn
          renderItemRow={renderFee}
        />
      </div>
    </SectionCard>
  );
};
