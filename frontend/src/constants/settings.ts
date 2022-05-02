import { Network } from "types";

export const DASHBOARD_URL = "https://dashboard.stellar.org";
export const STATUSPAGE_URL = "https://9sl3dhr1twv1.statuspage.io/api/v2";
export const STATUS_INCIDENTS_URL = "https://status.stellar.org/incidents";
export const RESET_STORE_ACTION_TYPE = "RESET";
export const NETWORK_SEARCH_PARAM = "network";
export const FRIENDBOT_PUBLIC_ADDRESS =
  "GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR";
export const FRIENDBOT_STARTING_BALANCE = "10000000000.0000000";

export const networkConfig = {
  [Network.MAINNET]: {
    url: "https://horizon.stellar.org",
    stellarbeatUrl: "https://api.stellarbeat.io",
  },
  [Network.TESTNET]: {
    url: "https://horizon-testnet.stellar.org",
    stellarbeatUrl: "https://api-testnet.stellarbeat.io",
  },
};
