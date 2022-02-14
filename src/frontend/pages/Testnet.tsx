import { NetworkStatus } from "frontend/components/NetworkStatus";
import { Network } from "types";

export const Testnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus network={Network.TESTNET} />
  </div>
);
