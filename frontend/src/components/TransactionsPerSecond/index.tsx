import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import BigNumber from "bignumber.js";
import { Icon } from "@stellar/design-system";

import "./styles.scss";

import {
  Network,
  ActionStatus,
  LedgerTransactionHistoryFilterType,
} from "types";
import {
  ledgerTransactionHistoryConfig,
  networkConfig,
} from "constants/settings";
import {
  VerticalBarChart,
  TimeRange,
} from "components/charts/VerticalBarChart";
import { useRedux } from "hooks/useRedux";
import { SectionCard } from "components/SectionCard";
import { AmountInfoCard } from "components/AmountInfoCard";
import { fetchTransactionsHistoryMonthAction } from "ducks/transactions";

export const TransactionsPerSecond = () => {
  const { transactions, ledgers } = useRedux("transactions", "ledgers");
  const dispatch = useDispatch();
  const lastLedger = ledgers.lastLedgerRecords[0];
  const selectedTimeInterval = LedgerTransactionHistoryFilterType["30D"];

  useEffect(() => {
    dispatch(fetchTransactionsHistoryMonthAction(Network.MAINNET));
  }, [dispatch]);

  const data = useMemo(() => {
    const result = transactions.transactionsHistory.items.map((item) => ({
      date: new Date(item.date),
      primaryValue: new BigNumber(
        new BigNumber(
          item.txTransactionCount / item.durationInSeconds,
        ).toFormat(2),
      ).toNumber(),
    }));

    return result;
  }, [transactions.transactionsHistory]);

  return (
    <SectionCard
      title="Transactions per second"
      titleLinkLabel="API"
      titleLink={`/api/ledgers${
        ledgerTransactionHistoryConfig[selectedTimeInterval].endpointPrefix
      }${networkConfig[Network.MAINNET].ledgerTransactionsHistorySuffix}`}
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
            primaryValueTooltipDescription="TPS"
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
