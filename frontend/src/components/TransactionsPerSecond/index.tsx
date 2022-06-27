import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import {
  ActionStatus,
  LedgerTransactionHistoryFilterType,
  Network,
} from "types";
import { SectionCard } from "components/SectionCard";
import {
  VerticalBarChart,
  TimeRange,
} from "components/charts/VerticalBarChart";

import "./styles.scss";
import { fetchTransactionsHistoryAction } from "ducks/transactions";

export const TransactionsPerSecond = () => {
  const { transactions } = useRedux("transactions");
  const dispatch = useDispatch();
  const selectedTimeInterval = LedgerTransactionHistoryFilterType["30D"];

  useEffect(() => {
    dispatch(fetchTransactionsHistoryAction(Network.MAINNET));
  }, [dispatch, selectedTimeInterval]);

  const data = useMemo(() => {
    const result = transactions.transactionsHistory.items.map((item) => ({
      date: new Date(item.date),
      primaryValue: item.txTransactionCount,
      secondaryValue: 0,
    }));

    return result;
  }, [transactions.transactionsHistory]);

  return (
    <SectionCard
      title="Transactions per second"
      titleLinkLabel="API"
      titleLink={`/api/ledgers${selectedTimeInterval}/public${Network.MAINNET}`}
      isLoading={transactions.status === ActionStatus.PENDING}
      noData={!data.length}
    >
      <div className="TransactionsPerSecond__mainChart">
        <div className="TransactionsPerSecond__mainChart__container">
          <VerticalBarChart
            data={data}
            primaryValueName="Transactions"
            secondaryValueName="Operations"
            timeRange={TimeRange.MONTH}
            primaryValueTooltipDescription="txns"
            secondaryValueTooltipDescription="ops"
          />
        </div>
      </div>
    </SectionCard>
  );
};
