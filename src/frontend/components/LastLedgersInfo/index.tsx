import React from "react";
import { Table } from "@stellar/design-system";
import { networkConfig } from "frontend/constants/settings";
import { useRedux } from "frontend/hooks/useRedux";
import { SectionCard } from "frontend/components/SectionCard";
import { LedgerClosedTime } from "frontend/components/LedgerClosedTime";
import { LedgerItem, Network } from "types";

import "./styles.scss";

export const LastLedgersInfo = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { ledgers } = useRedux("ledgers");
  const last10Ledgers = ledgers.lastLedgerRecords.slice(1, 11);

  const labels = [
    {
      id: "ledgerNumber",
      // TODO: add box icon, needs to support it in SDS
      label: "Ledger number",
    },
    {
      id: "transactions",
      label: "Transactions",
    },
    {
      id: "operations",
      label: "Operations",
    },
    {
      id: "closingTime",
      label: "Closing time",
    },
  ];

  const renderLedger = (ledger: LedgerItem) => (
    <React.Fragment key={ledger.sequenceNumber}>
      <td className="LastLedgersInfo__sequence">{ledger.sequenceNumber}</td>
      <td>
        {/* TODO: add chart */}
        {ledger.txCountSuccessful} succeeded / {ledger.txCountFailed} failed
      </td>
      {/* TODO: add chart */}
      <td>{ledger.opCount}</td>
      <td>
        <LedgerClosedTime closedTime={ledger.closedTime} />
      </td>
    </React.Fragment>
  );

  return (
    <SectionCard
      title="Last 10 Ledgers Info"
      titleLinkLabel="API"
      titleLink={`${networkConfig[network].url}/operations?order=desc&limit=20`}
    >
      <div className="LastLedgersInfo">
        <Table
          id="last-10-ledgers"
          data={last10Ledgers}
          columnLabels={labels}
          hideNumberColumn
          renderItemRow={renderLedger}
        />
      </div>
    </SectionCard>
  );
};
