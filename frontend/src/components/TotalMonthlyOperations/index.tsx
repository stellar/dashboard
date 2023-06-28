import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

import { useRedux } from "hooks/useRedux";
import { ActionStatus, Network } from "types";
import { fetchLedgerOperations } from "ducks/ledgers";
import { AppDispatch } from "config/store";
import { SectionCard } from "components/SectionCard";
import { VerticalBarChart } from "components/charts/VerticalBarChart";

import "./styles.scss";
import { RecentOperations } from "components/RecentOperations";

export const TotalMonthlyOperations = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { ledgers } = useRedux("ledgers");
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLedgerOperations());
  }, [dispatch]);

  const data = useMemo(() => {
    const reversedOperations = [...ledgers.ledgerOperations].reverse();

    if (reversedOperations.length) {
      const fisrtDate = new Date(reversedOperations[0].date);

      const operations = reversedOperations.map((operation) => ({
        date: new Date(
          parseInt(operation.date.split("-")[0]),
          // monthIndex starts at 0
          parseInt(operation.date.split("-")[1]) - 1,
        ),
        primaryValue: operation.primaryValue,
      }));

      return { operations, fisrtDate };
    }

    return { operations: [], fisrtDate: new Date() };
  }, [ledgers.ledgerOperations]);

  return (
    <>
      {network === Network.MAINNET ? (
        <SectionCard
          title="Total monthly operations"
          titleLinkLabel="API"
          titleLink={`/api/ledgers/op_stats`}
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
                primaryValueOnly
                baseStartDate={data.fisrtDate}
                maxLineOffset={550000000}
              />
            </div>
          </div>

          <RecentOperations network={network} />
        </SectionCard>
      ) : (
        <RecentOperations network={network} />
      )}
    </>
  );
};
