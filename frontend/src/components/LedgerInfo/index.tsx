import { useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { TextLink } from "@stellar/design-system";
import { useDispatch } from "react-redux";

import { SectionCard } from "components/SectionCard";
import { VerticalBarChart } from "components/charts/VerticalBarChart";
import { AmountInfoCard } from "components/AmountInfoCard";
import { CircularChart } from "components/charts/CircularChart";
import { BatteryLikeChart } from "components/charts/BatteryLikeChart";
import { LedgerClosedTime } from "components/LedgerClosedTime";

import {
  ledgerTransactionHistoryConfig,
  networkConfig,
} from "constants/settings";
import {
  ActionStatus,
  LedgerTransactionHistoryFilterType,
  Network,
} from "types";

import { useRedux } from "hooks/useRedux";
import { fetchLedgersTransactionsHistoryAction } from "ducks/ledgers";
import { formatDate } from "helpers/formatDate";

import "./styles.scss";
import { TimeRange } from "components/charts/BaseTwoValuesChart";

const TIME_RANGE_MAPPING = {
  [VerticalBarChart.TimeRange.HOUR]: {
    key: "lastHour",
    label: LedgerTransactionHistoryFilterType["1H"],
  },
  [VerticalBarChart.TimeRange.DAY]: {
    key: "last24Hours",
    label: LedgerTransactionHistoryFilterType["24H"],
  },
  [VerticalBarChart.TimeRange.MONTH]: {
    key: "last30Days",
    label: LedgerTransactionHistoryFilterType["30D"],
  },
};

export const LedgerInfo = ({
  network = Network.MAINNET,
}: {
  network?: Network;
}) => {
  const dispatch = useDispatch();

  const {
    ledgers: { ledgerTransactionsHistory, status },
  } = useRedux("ledgers");

  const [rangeInterval, setRangeInterval] = useState<"hour" | "day" | "month">(
    VerticalBarChart.TimeRange.HOUR,
  );

  const selectedTimeInterval = useMemo(
    () => TIME_RANGE_MAPPING[rangeInterval].label,
    [rangeInterval],
  );

  useEffect(() => {
    dispatch(
      fetchLedgersTransactionsHistoryAction({
        network,
        filter: selectedTimeInterval,
      }),
    );
  }, [network, dispatch, selectedTimeInterval]);

  const itemsData = useMemo(
    () =>
      ledgerTransactionsHistory.items.map((item) => ({
        date: new Date(item.date),
        primaryValue: item.txTransactionCount,
        secondaryValue: item.opCount,
        tooltipTitle: `#${item.sequence}`,
        tooltipSubtitle: formatDate(item.date, "Pp"),
      })),
    [ledgerTransactionsHistory],
  );

  const data = useMemo(
    () => ({
      graphData: itemsData,
      averageTransactions: {
        success: ledgerTransactionsHistory.average.txTransactionSuccess,
        error: ledgerTransactionsHistory.average.txTransactionError,
      },
      averageOperations: ledgerTransactionsHistory.average.opCount,
      averageClosingTime: ledgerTransactionsHistory.average.closeTimeAvg,
    }),
    [itemsData, ledgerTransactionsHistory],
  );

  const graphNavOptionsContent = useMemo(
    () => (
      <div className="LedgerInfo__titleNav">
        {Object.entries(TIME_RANGE_MAPPING).map(([key, { label }]) => (
          <TextLink
            key={key}
            variant={TextLink.variant.secondary}
            onClick={() =>
              setRangeInterval(key as keyof typeof TIME_RANGE_MAPPING)
            }
            className={`LedgerInfo__titleNav--${
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
      titleLink={`/api/ledgers${ledgerTransactionHistoryConfig[selectedTimeInterval].endpointPrefix}/public${networkConfig[network].ledgerTransactionsHistorySuffix}`}
      titleCustom={graphNavOptionsContent}
      isLoading={status === ActionStatus.PENDING}
      noData={!itemsData.length}
    >
      <div className="LedgerInfo">
        <div className="LedgerInfo__mainChart">
          <div className="LedgerInfo__mainChart__container">
            <VerticalBarChart
              data={data.graphData}
              primaryValueName="Transactions"
              secondaryValueName="Operations"
              timeRange={rangeInterval as TimeRange}
              primaryValueTooltipDescription="txns"
              secondaryValueTooltipDescription="ops"
            />
          </div>
        </div>
        <div className="LedgerInfo__cardsRow">
          <AmountInfoCard
            title="AVG Transactions"
            amount={new BigNumber(data.averageTransactions.success).toFormat()}
            amountBy={new BigNumber(data.averageTransactions.error).toFormat()}
            amountPrefixContent={
              <div className="LedgerInfo__transactionsChartContainer">
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
              <div className="LedgerInfo__operationsChartContainer">
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
