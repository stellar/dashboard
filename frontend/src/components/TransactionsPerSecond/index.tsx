import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Card } from "@stellar/design-system";
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
import { CircularChart } from "components/charts/CircularChart";
import { LedgerClosedTime } from "components/LedgerClosedTime";
import { fetchTransactionsHistoryAction } from "ducks/transactions";
import "./styles.scss";

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
          <Card>
            <div className="TransactionsPerSecond__cardTitle">
              Current transactions
            </div>

            <div className="TransactionsPerSecond__detail">
              <div className="AmountInfoCard__detail__title">Transactions</div>
              <div className="TransactionsPerSecond__detail__text">
                <div className="TransactionsPerSecond__detail__text__circularChart">
                  <CircularChart
                    data={[
                      { label: "Success", value: lastLedger.txCountSuccessful },
                      { label: "Error", value: lastLedger.txCountFailed },
                    ]}
                    tooltipEnabled={false}
                    lineWidth={0.5}
                    colorType={CircularChart.ColorType.SECONDARY}
                  />
                </div>
                {lastLedger.txCountSuccessful} succeeded /{" "}
                {lastLedger.txCountFailed} failed
              </div>
            </div>

            <div className="TransactionsPerSecond__detail">
              <div className="ATransactionsPerSecond__title">
                Transactions per second
              </div>
              <div className="TransactionsPerSecond__detail__text">
                {new BigNumber(
                  (lastLedger.txCountSuccessful + lastLedger.txCountFailed) /
                    lastLedger.closedTime,
                ).toFormat(2)}{" "}
                tps
              </div>
            </div>

            <div className="TransactionsPerSecond__detail">
              <div className="TransactionsPerSecond__title">
                Ledger closing time
              </div>
              <div className="TransactionsPerSecond__detail__text">
                <LedgerClosedTime closedTime={lastLedger.closedTime} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </SectionCard>
  );
};
