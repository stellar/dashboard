import { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { TextLink } from "@stellar/design-system";

import { addMinutes, subMinutes } from "date-fns";

import { SectionCard } from "components/SectionCard";
import { VerticalBarChart } from "components/charts/VerticalBarChart";
import { AmountInfoCard } from "components/AmountInfoCard";
import { CircularChart } from "components/charts/CircularChart";
import { BatteryLikeChart } from "components/charts/BatteryLikeChart";
import { LedgerClosedTime } from "components/LedgerClosedTime";

import { networkConfig } from "constants/settings";
import { Network } from "types";

import "./styles.scss";

const start = subMinutes(new Date("2022-05-10T20:20:51.176Z"), 40);

const generateChartData = () =>
  [...Array(30)].map((_, index) => ({
    date: addMinutes(start, index * 2),
    primaryValue: Math.trunc(Math.random() * 1000),
    secondaryValue: Math.trunc(Math.random() * 1000),
    tooltipTitle: `#${Math.trunc(Math.random() * 100000) + index}`,
  }));

const TIME_RANGE_MAPPING = {
  [VerticalBarChart.TimeRange.HOUR]: {
    key: "lastHour",
    label: "1HR",
  },
  [VerticalBarChart.TimeRange.DAY]: {
    key: "last24Hours",
    label: "24HR",
  },
  [VerticalBarChart.TimeRange.MONTH]: {
    key: "last30Days",
    label: "30D",
  },
};

export const LedgerInfo = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  // todo: get from redux state
  const data = useMemo(
    () => ({
      graphData: {
        lastHour: generateChartData(),
        last24Hours: generateChartData(),
        last30Days: generateChartData(),
      },
      averageTransactions: {
        success: 600,
        error: 200,
      },
      averageOperations: 600,
      averageClosingTime: 5.1,
    }),
    [],
  );

  const [rangeInterval, setRangeInterval] = useState(
    VerticalBarChart.TimeRange.HOUR,
  );

  const graphParams = useMemo(() => {
    const mapping = TIME_RANGE_MAPPING[rangeInterval];
    const rangeData =
      data.graphData[mapping.key as keyof typeof data.graphData];
    return {
      label: mapping.label,
      data: rangeData,
    };
  }, [data, rangeInterval]);

  const graphNavOptionsContent = useMemo(
    () => (
      <div className="LedgerInfo__title_nav">
        {Object.entries(TIME_RANGE_MAPPING).map(([key, { label }]) => (
          <TextLink
            key={key}
            variant={TextLink.variant.secondary}
            onClick={() =>
              setRangeInterval(key as keyof typeof TIME_RANGE_MAPPING)
            }
            className={`LedgerInfo__title_nav--${
              rangeInterval === key ? "active" : "inactive"
            }`}
          >
            {label}
          </TextLink>
        ))}
      </div>
    ),
    [rangeInterval, setRangeInterval],
  );

  return (
    <SectionCard
      title="Ledger Info"
      titleLinkLabel="API"
      // TODO: update link
      titleLink={`${networkConfig[network].url}/operations?order=desc&limit=20`}
      titleCustom={graphNavOptionsContent}
    >
      <div className="LedgerInfo">
        <div className="LedgerInfo__main_chart_container">
          <VerticalBarChart
            data={graphParams.data}
            primaryValueName="Transactions"
            secondaryValueName="Operations"
            timeRange={rangeInterval}
            baseStartDate={start}
          />
        </div>
        <div className="LedgerInfo__cards_row">
          <AmountInfoCard
            title="AVG Transactions"
            amount={new BigNumber(data.averageTransactions.success).toFormat()}
            amountBy={new BigNumber(data.averageTransactions.error).toFormat()}
            amountPrefixContent={
              <div className="LedgerInfo__transactions_chart_container">
                <CircularChart
                  data={[
                    {
                      label: "Success",
                      value: data.averageTransactions.success,
                    },
                    {
                      label: "Error",
                      value: data.averageTransactions.error,
                    },
                  ]}
                  tooltipEnabled={false}
                  lineWidth={0.5}
                  colorType={CircularChart.ColorType.SECONDARY}
                />
              </div>
            }
            description="in the last hour"
          />
          <AmountInfoCard
            title="AVG Operations"
            amount={new BigNumber(data.averageOperations).toFormat()}
            amountPrefixContent={
              <div className="LedgerInfo__operations_chart_container">
                <BatteryLikeChart value={data.averageOperations / 10} />
              </div>
            }
            description="in the last hour"
          />
          <AmountInfoCard
            title="AVG CLOSING TIME"
            amount={`${data.averageClosingTime}s`}
            amountPrefixContent={
              <LedgerClosedTime
                showPrefix={false}
                closedTime={data.averageClosingTime}
              />
            }
            description="in the last hour"
          />
        </div>
      </div>
    </SectionCard>
  );
};
