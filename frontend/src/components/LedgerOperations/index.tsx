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

// max operations per day = 12*60*24*1000 = 17,280,000
const limitLine = 17280000;

export const LedgerOperations = () => {
  const { ledgers } = useRedux("ledgers");
  const dispatch = useDispatch();

  const historyFilter = ledgerTransactionHistoryConfig["30D"];

  useEffect(() => {
    dispatch(fetchLedgerOperations());
  }, [dispatch]);

  const data = useMemo(() => {
    const reversedOperations = [...ledgers.ledgerOperations].reverse();

    return reversedOperations.map((operation) => ({
      date: new Date(operation.date),
      primaryValue: operation.primaryValue,
    }));
  }, [ledgers.ledgerOperations]);

  return (
    <SectionCard
      title="Ledger Operations"
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
            data={data}
            primaryValueName="Operations"
            timeRange={VerticalBarChart.TimeRange.MONTH}
            primaryValueTooltipDescription="ops"
            maxLine={limitLine}
            primaryValueOnly
          />
        </div>
      </div>
    </SectionCard>
  );
};
