import { useEffect } from "react";
import { useDispatch } from "react-redux";

import "./styles.scss";

import { fetchLedgersModule } from "ducks/ledgers";
import { SectionCard } from "components/SectionCard";
import { VerticalBarChart } from "components/charts/VerticalBarChart";
import { useRedux } from "hooks/useRedux";
import { ActionStatus } from "types";

const limitLine = 17280;

export const LedgerModule = () => {
  const { ledgers } = useRedux("ledgers");
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchLedgersModule());
  }, [dispatch]);

  return (
    <SectionCard
      title="Ledger Module"
      titleLinkLabel="API"
      titleLink={`/api/ledgers`}
      isLoading={ledgers.status === ActionStatus.PENDING}
      noData={!ledgers.ledgerModule.length}
    >
      {ledgers.ledgerModule.length > 0 && (
        <div className="LedgerModule__mainChart">
          <div className="LedgerModule__mainChart__container">
            <VerticalBarChart
              data={ledgers.ledgerModule}
              primaryValueName="Operations"
              timeRange={VerticalBarChart.TimeRange.HOUR}
              primaryValueTooltipDescription="ops"
              maxLine={limitLine}
              primaryValueOnly
            />
          </div>
        </div>
      )}
    </SectionCard>
  );
};
