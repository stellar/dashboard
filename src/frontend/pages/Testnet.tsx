import { NetworkStatus } from "frontend/components/NetworkStatus";
import { LastLedger } from "frontend/components/LastLedger";
import { LastLedgersInfo } from "frontend/components/LastLedgersInfo";
import { Network } from "types";

export const Testnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus network={Network.TESTNET} />
    <LastLedger network={Network.TESTNET} />
    <LastLedgersInfo network={Network.TESTNET} />
  </div>
);
