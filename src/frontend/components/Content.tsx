import { useSearchParams } from "react-router-dom";

import { Network, NETWORK_SEARCH_PARAM } from "frontend/constants/settings";
import { Mainnet } from "frontend/pages/Mainnet";
import { Testnet } from "frontend/pages/Testnet";

export const Content = () => {
  const [searchParams] = useSearchParams();
  const network = searchParams.get(NETWORK_SEARCH_PARAM);

  if (network === Network.MAINNET) {
    return <Mainnet />;
  }

  if (network === Network.TESTNET) {
    return <Testnet />;
  }

  return null;
};
