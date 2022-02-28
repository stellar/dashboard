import { NetworkStatus } from "components/NetworkStatus";
import { LastLedger } from "components/LastLedger";
import { LastLedgersInfo } from "components/LastLedgersInfo";
import { NetworkNodes } from "components/NetworkNodes";
import { Network } from "types";

export const Testnet = () => (
  <div className="ContentWrapper">
    <NetworkStatus network={Network.TESTNET} />
    <LastLedger network={Network.TESTNET} />
    <LastLedgersInfo network={Network.TESTNET} />
    <NetworkNodes network={Network.TESTNET} />
  </div>
);
