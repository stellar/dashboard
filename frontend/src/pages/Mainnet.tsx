import { NetworkStatus } from "components/NetworkStatus";
import { LastLedger } from "components/LastLedger";
import { LastLedgersInfo } from "components/LastLedgersInfo";
import { LedgerInfo } from "components/LedgerInfo";
import { ByTheNumbers } from "components/ByTheNumbers";
import { LumenSupply } from "components/LumenSupply";
import { NetworkNodes } from "components/NetworkNodes";
import { Incidents } from "components/Incidents";
import { TransactionsPerSecond } from "components/TransactionsPerSecond";

export const Mainnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus />
    <LastLedger />
    <LastLedgersInfo />
    <LedgerInfo />
    <TransactionsPerSecond />
    <ByTheNumbers />
    <LumenSupply />
    <NetworkNodes />
    <Incidents />
  </div>
);
