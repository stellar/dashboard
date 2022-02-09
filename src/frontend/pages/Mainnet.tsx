import { NetworkStatus } from "frontend/components/NetworkStatus";
import { LastLedger } from "frontend/components/LastLedger";
import { LastLedgersInfo } from "frontend/components/LastLedgersInfo";
import { LedgerInfo } from "frontend/components/LedgerInfo";
import { ByTheNumbers } from "frontend/components/ByTheNumbers";
import { LumenSupply } from "frontend/components/LumenSupply";
import { NetworkNodes } from "frontend/components/NetworkNodes";
import { Incidents } from "frontend/components/Incidents";

export const Mainnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus />
    <LastLedger />
    <LastLedgersInfo />
    <LedgerInfo />
    <ByTheNumbers />
    <LumenSupply />
    <NetworkNodes />
    <Incidents />
  </div>
);
