import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import BigNumber from "bignumber.js";

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
import { fetchTransactionsHistoryAction } from "ducks/transactions";
import "./styles.scss";
import { AmountInfoCard } from "components/AmountInfoCard";
import { Icon } from "@stellar/design-system";

export const TransactionsPerSecond = () => {
  const { transactions, ledgers } = useRedux("transactions", "ledgers");
  const dispatch = useDispatch();
  const lastLedger = ledgers.lastLedgerRecords[0];
  const selectedTimeInterval = LedgerTransactionHistoryFilterType["30D"];

  useEffect(() => {
    dispatch(fetchTransactionsHistoryAction(Network.MAINNET));
  }, [dispatch, selectedTimeInterval]);

  const data = useMemo(() => {
    const result = transactions.transactionsHistory.items.map((item) => ({
      date: new Date(item.date),
      primaryValue: new BigNumber(
        new BigNumber(item.txTransactionCount / 84600).toFormat(2),
      ).toNumber(),
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
            primaryValueOnly
            primaryValueName="Transactions"
            timeRange={TimeRange.MONTH}
            primaryValueTooltipDescription="tps"
          />
        </div>
      </div>

      {lastLedger && (
        <div className="TransactionsPerSecond__card">
          <AmountInfoCard
            title="Current TPS"
            amount={`${new BigNumber(
              (lastLedger.txCountSuccessful + lastLedger.txCountFailed) /
                lastLedger.closedTime,
            ).toFormat(2)} tps`}
            amountPrefixContent={
              <Icon.Clock className="TransactionsPerSecond__card__icon" />
            }
            description="in the last ledger"
          />
        </div>
      )}
    </SectionCard>
  );
};
