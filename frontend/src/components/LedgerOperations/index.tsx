import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import { ActionStatus, Network } from "types";
import { fetchLedgerOperations } from "ducks/ledgers";
import { SectionCard } from "components/SectionCard";
import { VerticalBarChart } from "components/charts/VerticalBarChart";
import {
  ledgerTransactionHistoryConfig,
  networkConfig,
} from "constants/settings";

import "./styles.scss";
import { RecentOperations } from "components/RecentOperations";

// max operations per month = 12*1000*60*24*30 = 518400000
const limitLine = 518400000;

export const LedgerOperations = () => {
  const { ledgers } = useRedux("ledgers");
  const dispatch = useDispatch();

  const historyFilter = ledgerTransactionHistoryConfig["30D"];

  useEffect(() => {
    dispatch(fetchLedgerOperations());
  }, [dispatch]);

  const data = useMemo(() => {
    const reversedOperations = [...ledgers.ledgerOperations].reverse();

    if (reversedOperations.length) {
      const fisrtDate = new Date(reversedOperations[0].date);

      const operations = reversedOperations.map((operation) => ({
        date: new Date(operation.date),
        primaryValue: operation.primaryValue,
      }));

      return { operations, fisrtDate };
    }

    return { operations: [], fisrtDate: new Date() };
  }, [ledgers.ledgerOperations]);

  return (
    <SectionCard
      title="Total monthly operations"
      titleLinkLabel="API"
      titleLink={`/api/ledgers${historyFilter.endpointPrefix}${
        networkConfig[Network.MAINNET].ledgerTransactionsHistorySuffix
      }`}
      isLoading={ledgers.status === ActionStatus.PENDING}
      noData={!ledgers.ledgerOperations.length}
    >
      <div className="LedgerOperations__mainChart">
        <div className="LedgerOperations__mainChart__container">
          <VerticalBarChart
            data={data.operations}
            primaryValueName="Operations"
            timeRange={VerticalBarChart.TimeRange.YEAR}
            primaryValueTooltipDescription="ops"
            maxLine={limitLine}
            primaryValueOnly
            baseStartDate={data.fisrtDate}
          />
        </div>
      </div>

      <RecentOperations />
    </SectionCard>
  );
};
