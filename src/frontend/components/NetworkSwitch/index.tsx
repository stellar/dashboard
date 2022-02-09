import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Network, NETWORK_SEARCH_PARAM } from "frontend/constants/settings";

import "./styles.scss";

export const NetworkSwitch = () => {
  const networkOptions: string[] = Object.values(Network);
  const [searchParams, setSearchParams] = useSearchParams();
  const networkParamValue = searchParams.get(NETWORK_SEARCH_PARAM);

  const updateNetworkValue = useCallback(
    (value: Network) => {
      if (value === networkParamValue) {
        return;
      }

      setSearchParams({ [NETWORK_SEARCH_PARAM]: value });
    },
    [networkParamValue, setSearchParams],
  );

  useEffect(() => {
    if (!networkOptions.includes(networkParamValue || "")) {
      updateNetworkValue(Network.MAINNET);
    }
  }, [networkOptions, networkParamValue, updateNetworkValue]);

  const getStatusMessageText = () => {
    if (networkParamValue === Network.MAINNET) {
      return "Live";
    }

    if (networkParamValue === Network.TESTNET) {
      return "Test";
    }

    return "Unknown";
  };

  return (
    <div className="NetworkSwitch">
      <div
        className={`NetworkSwitch__statusMessage NetworkSwitch__statusMessage--${networkParamValue}`}
      >{`${getStatusMessageText()} Network Status`}</div>
      <div className="NetworkSwitch__tabs">
        <div
          className={`NetworkSwitch__tabs__tabItem ${
            networkParamValue === Network.MAINNET
              ? "NetworkSwitch__tabs__tabItem--active"
              : ""
          }`}
          role="button"
          onClick={() => updateNetworkValue(Network.MAINNET)}
        >
          Mainnet
        </div>
        <div
          className={`NetworkSwitch__tabs__tabItem ${
            networkParamValue === Network.TESTNET
              ? "NetworkSwitch__tabs__tabItem--active"
              : ""
          }`}
          role="button"
          onClick={() => updateNetworkValue(Network.TESTNET)}
        >
          Testnet
        </div>
      </div>
    </div>
  );
};
