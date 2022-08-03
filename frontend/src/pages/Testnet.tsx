import { NetworkStatus } from "components/NetworkStatus";
import { LastLedger } from "components/LastLedger";
import { LastLedgersInfo } from "components/LastLedgersInfo";
import { LedgerInfo } from "components/LedgerInfo";
import { LumenSupply } from "components/LumenSupply";
import { NetworkNodes } from "components/NetworkNodes";
import { TransactionsPerSecond } from "components/TransactionsPerSecond";
import { TotalMonthlyOperations } from "components/TotalMonthlyOperations";
import { Network } from "types";

export const Testnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus network={Network.TESTNET} />
    <LastLedger network={Network.TESTNET} />
    <LedgerInfo network={Network.TESTNET} />
    <LastLedgersInfo network={Network.TESTNET} />
    <TotalMonthlyOperations network={Network.TESTNET} />
    <TransactionsPerSecond network={Network.TESTNET} />
    <LumenSupply network={Network.TESTNET} />
    <NetworkNodes network={Network.TESTNET} />
  </div>
);
