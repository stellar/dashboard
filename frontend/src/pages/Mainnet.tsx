import { NetworkStatus } from "components/NetworkStatus";
import { LastLedger } from "components/LastLedger";
import { LastLedgersInfo } from "components/LastLedgersInfo";
import { LedgerInfo } from "components/LedgerInfo";
import { ByTheNumbers } from "components/ByTheNumbers";
import { LumenSupply } from "components/LumenSupply";
import { NetworkNodes } from "components/NetworkNodes";
import { Incidents } from "components/Incidents";
import { TransactionsPerSecond } from "components/TransactionsPerSecond";
import { RecentOperations } from "components/RecentOperations";
import { FeeStats } from "components/FeeStats";
import { XML } from "components/XML";
import { AverageTransactionFee } from "components/AverageTransactionFee";
import { LedgerModule } from "components/LedgerModule";

export const Mainnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus />
    <LastLedger />
    <LastLedgersInfo />
    <LedgerInfo />
    <TransactionsPerSecond />
    <RecentOperations />
    <LedgerModule />
    <ByTheNumbers />
    <LumenSupply />
    <NetworkNodes />
    <FeeStats />
    <XML />
    <AverageTransactionFee />
    <Incidents />
  </div>
);
