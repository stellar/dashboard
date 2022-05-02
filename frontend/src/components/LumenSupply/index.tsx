import { useEffect } from "react";
import { TextLink, Icon } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import BigNumber from "bignumber.js";

import { SectionCard } from "components/SectionCard";
import { DASHBOARD_URL, FRIENDBOT_PUBLIC_ADDRESS } from "constants/settings";
import { fetchLumenSupplyAction } from "ducks/lumenSupply";
import { formatAmount } from "helpers/formatAmount";
import { useRedux } from "hooks/useRedux";
import { ActionStatus, Network } from "types";

import "./styles.scss";

export const LumenSupply = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { lumenSupply } = useRedux("lumenSupply");
  const { data } = lumenSupply;
  const dispatch = useDispatch();
  const isTestnet = network === Network.TESTNET;
  const apiEndpoint = `${DASHBOARD_URL}/api/v3/lumens/`;

  useEffect(() => {
    dispatch(fetchLumenSupplyAction(network));
  }, [network, dispatch]);

  const items = [
    {
      id: "circulating",
      label: isTestnet ? (
        <>
          Friendbot:
          <TextLink
            href={`https://horizon-testnet.stellar.org/accounts/${FRIENDBOT_PUBLIC_ADDRESS}`}
          >
            GAIH
          </TextLink>
        </>
      ) : (
        "Circulating Supply"
      ),
      amount: data?.circulating,
      apiUrl: isTestnet ? null : apiEndpoint,
    },
    {
      id: "nonCirculating",
      label: "Non-Circulating Supply",
      amount: data?.nonCirculating,
      apiUrl: isTestnet ? null : apiEndpoint,
    },
    {
      id: "total",
      label: "Total XLM Supply",
      amount: data?.total,
      apiUrl: isTestnet ? null : apiEndpoint,
    },
  ];

  return (
    <SectionCard
      title="Total XLM Issued"
      titleLinkLabel="Lumen Supply Metrics"
      titleLink="https://developers.stellar.org/docs/glossary/lumen-supply/"
      isLoading={lumenSupply.status === ActionStatus.PENDING}
      noData={!data}
    >
      {data ? (
        <div className="LumenSupply">
          <div className="LumenSupply__chart">
            <div className="LumenSupply__chart__item" />
          </div>
          <div className="LumenSupply__supply">
            {items.map((i) => (
              <div key={i.id} className="LumenSupply__supply__item">
                <div className="LumenSupply__supply__item__info">
                  <div
                    className={`LumenSupply__supply__item__label
                      ${
                        i.id === "total"
                          ? "LumenSupply__supply__item__bold"
                          : ""
                      }
                    `}
                  >
                    <div className="LumenSupply__supply__item__chart" />
                    {i.label}
                  </div>
                  {i.apiUrl ? (
                    <TextLink href={i.apiUrl} iconRight={<Icon.ExternalLink />}>
                      API
                    </TextLink>
                  ) : null}
                </div>
                <div className="LumenSupply__supply__item__amounts">
                  <div className="LumenSupply__supply__item__bold">
                    {formatAmount(i.amount || 0)} XLM
                  </div>
                  <div>{new BigNumber(i.amount || 0).toFormat(7)} XLM</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
};
