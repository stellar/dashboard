import { Network } from "types";

export const STATUSPAGE_URL = "https://9sl3dhr1twv1.statuspage.io/api/v2";
export const STATUS_INCIDENTS_URL = "https://status.stellar.org/incidents";
export const RESET_STORE_ACTION_TYPE = "RESET";
export const NETWORK_SEARCH_PARAM = "network";

export const networkConfig = {
  [Network.MAINNET]: {
    url: "https://horizon.stellar.org",
  },
  [Network.TESTNET]: {
    url: "https://horizon-testnet.stellar.org",
  },
};
