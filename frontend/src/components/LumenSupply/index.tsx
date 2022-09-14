import { useEffect, useMemo } from "react";
import { TextLink, Icon } from "@stellar/design-system";
import { useDispatch } from "react-redux";
import BigNumber from "bignumber.js";

import { SectionCard } from "components/SectionCard";
import {
  CircularChart,
  CircularChartData,
} from "components/charts/CircularChart";
import { DASHBOARD_URL, FRIENDBOT_PUBLIC_ADDRESS } from "constants/settings";
import { fetchLumenSupplyAction } from "ducks/lumenSupply";
import { formatAmount } from "helpers/formatAmount";
import { useRedux } from "hooks/useRedux";
import { ActionStatus, Network } from "types";

import "./styles.scss";

const apiEndpoint = `${DASHBOARD_URL}/api/v3/lumens/`;

export const LumenSupply = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const { lumenSupply } = useRedux("lumenSupply");
  const { data } = lumenSupply;
  const dispatch = useDispatch();
  const isTestnet = useMemo(() => network === Network.TESTNET, [network]);

  useEffect(() => {
    dispatch(fetchLumenSupplyAction(network));
  }, [network, dispatch]);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }

    return [
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
        amount: data.circulating,
        apiUrl: isTestnet ? null : apiEndpoint,
        chartData: [
          {
            label: "Circulating",
            value: new BigNumber(data.circulating).toNumber(),
          },
          {
            label: "Placeholder",
            value: 0,
          },
        ] as CircularChartData,
      },
      {
        id: "nonCirculating",
        label: "Non-Circulating Supply",
        amount: data.nonCirculating,
        apiUrl: isTestnet ? null : apiEndpoint,
        chartData: [
          {
            label: "Placeholder",
            value: 0,
          },
          {
            label: "Non-Circulating",
            value: new BigNumber(data.nonCirculating).toNumber(),
          },
        ] as CircularChartData,
      },
      {
        id: "total",
        label: "Total XLM Supply",
        amount: data.total,
        apiUrl: isTestnet ? null : apiEndpoint,
        chartData: [
          {
            label: `${formatAmount(data.circulating)} XLM`,
            value: new BigNumber(data.circulating).toNumber(),
          },
          {
            label: `${formatAmount(data.nonCirculating)} XLM`,
            value: new BigNumber(data.nonCirculating).toNumber(),
          },
        ] as CircularChartData,
      },
    ];
  }, [data, isTestnet]);

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
            <div className="LumenSupply__chart__item">
              <CircularChart
                data={[
                  {
                    label: `${formatAmount(data.circulating)} XLM`,
                    value: new BigNumber(data.circulating).toNumber(),
                  },
                  {
                    label: `${formatAmount(data.nonCirculating)} XLM`,
                    value: new BigNumber(data.nonCirculating).toNumber(),
                  },
                ]}
                tooltipTitle="Total XLM"
              />
            </div>
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
                    <div className="LumenSupply__supply__item__chart">
                      <CircularChart
                        data={i.chartData}
                        tooltipEnabled={false}
                        lineWidth={1}
                      />
                    </div>
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
