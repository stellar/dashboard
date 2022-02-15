import { NetworkStatus } from "frontend/components/NetworkStatus";
import { LastLedger } from "frontend/components/LastLedger";
import { Network } from "types";

export const Testnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus network={Network.TESTNET} />
    <LastLedger />
  </div>
);
