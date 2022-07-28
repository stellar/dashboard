import { NetworkStatus } from "components/NetworkStatus";
import { LastLedger } from "components/LastLedger";
import { LastLedgersInfo } from "components/LastLedgersInfo";
import { LedgerInfo } from "components/LedgerInfo";
import { ByTheNumbers } from "components/ByTheNumbers";
import { Incidents } from "components/Incidents";
import { TransactionsPerSecond } from "components/TransactionsPerSecond";
import { FeeStats } from "components/FeeStats";
import { LedgerOperations } from "components/LedgerOperations";

export const Mainnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus />
    <LastLedger />
    <LedgerInfo />
    <LastLedgersInfo />
    <LedgerOperations />
    <TransactionsPerSecond />
    <FeeStats />
    <ByTheNumbers />
    <Incidents />
  </div>
);
