import { NetworkStatus } from "components/NetworkStatus";
import { LastLedger } from "components/LastLedger";
import { LastLedgersInfo } from "components/LastLedgersInfo";
import { LedgerInfo } from "components/LedgerInfo";
import { ByTheNumbers } from "components/ByTheNumbers";
import { Incidents } from "components/Incidents";
import { TransactionsPerSecond } from "components/TransactionsPerSecond";
import { TransactionFeeInfo } from "components/TransactionFeeInfo";
import { TotalMonthlyOperations } from "components/TotalMonthlyOperations";

export const Mainnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus />
    <LastLedger />
    <LedgerInfo />
    <LastLedgersInfo />
    <TotalMonthlyOperations />
    <TransactionsPerSecond />
    <TransactionFeeInfo />
    <ByTheNumbers />
    <Incidents />
  </div>
);
