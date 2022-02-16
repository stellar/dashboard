import { Icon, Loader } from "@stellar/design-system";
import { networkConfig } from "frontend/constants/settings";
import { useRedux } from "frontend/hooks/useRedux";
import { SectionCard } from "frontend/components/SectionCard";
import { LedgerClosedTime } from "frontend/components/LedgerClosedTime";
import { ActionStatus, Network } from "types";

import "./styles.scss";

export const LastLedger = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { ledgers } = useRedux("ledgers");
  const isPending = ledgers.status === ActionStatus.PENDING;
  const lastLedger = ledgers.lastLedgerRecords[0];

  return (
    <SectionCard
      title="Last Ledger"
      titleIcon={<Icon.Box />}
      titleLinkLabel="Recent Ops"
      titleLink={`${networkConfig[network].url}/operations?order=desc&limit=20`}
    >
      {isPending || !lastLedger ? (
        <Loader />
      ) : (
        <div className="LastLedger">
          <div className="LastLedger__sequence">
            {lastLedger.sequenceNumber}
          </div>
          <div className="LastLedger__details">
            <div className="LastLedger__row">
              <div className="LastLedger__row__label">Transactions</div>
              <div className="LastLedger__row__value">
                {/* TODO: add chart */}
                {lastLedger.txCountSuccessful} succeeded <span>/</span>{" "}
                {lastLedger.txCountFailed} failed
              </div>
            </div>
            <div className="LastLedger__row">
              <div className="LastLedger__row__label">Operations</div>
              <div className="LastLedger__row__value">{lastLedger.opCount}</div>
            </div>
            <div className="LastLedger__row">
              {/* TODO: add chart */}
              <div className="LastLedger__row__label">Ledger closing time</div>
              <div className="LastLedger__row__value">
                <LedgerClosedTime closedTime={lastLedger.closedTime} />
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
