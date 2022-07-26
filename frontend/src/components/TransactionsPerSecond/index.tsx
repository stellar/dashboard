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

export const TransactionsPerSecond = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { transactions } = useRedux("transactions");
  const dispatch = useDispatch();
  const selectedTimeInterval = LedgerTransactionHistoryFilterType["30D"];

  useEffect(() => {
    dispatch(fetchTransactionsHistoryMonthAction(network));
  }, [dispatch, network]);

  const data = useMemo(() => {
    const formattedItems = [
      ...transactions.transactionsHistory.items,
    ].reverse();

    const result = formattedItems.map((item) => ({
      date: new Date(item.date),
      primaryValue: new BigNumber(
        new BigNumber(item.txOperationCount / item.durationInSeconds).toFormat(
          2,
        ),
      ).toNumber(),
    }));

    return result;
  }, [transactions.transactionsHistory]);

  const weekData = useMemo(() => {
    const sliceWeek = transactions.transactionsHistory.items.slice(0, 7);

    const result = sliceWeek.reduce(
      (acc, cur) => {
        acc.txCount += cur.txOperationCount;
        acc.closedTime += cur.durationInSeconds;

        return acc;
      },
      { txCount: 0, closedTime: 0 },
    );

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
      {weekData && (
        <div className="TransactionsPerSecond__card">
          <AmountInfoCard
            title="Current TPS"
            amount={`${new BigNumber(
              weekData.txCount / weekData.closedTime,
            ).toFormat(2)} tps`}
            amountPrefixContent={
              <Icon.Clock className="TransactionsPerSecond__card__icon" />
            }
            description="in the last week"
          />
        </div>
      )}

      <div className="TransactionsPerSecond__mainChart">
        <div className="TransactionsPerSecond__mainChart__container">
          <VerticalBarChart
            data={data}
            primaryValueOnly
            primaryValueName="Average Daily Transactions"
            timeRange={TimeRange.MONTH}
            primaryValueTooltipDescription="TPS"
          />
        </div>
      </div>
    </SectionCard>
  );
};
