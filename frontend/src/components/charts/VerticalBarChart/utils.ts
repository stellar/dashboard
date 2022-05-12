import {
  TimeRange,
  VerticalBarChartProps,
  VerticalBarChartTooltipInnerProps,
} from "./types";
import { TooltipData } from "../Tooltip";
import {
  addDays,
  addHours,
  addMinutes,
  format,
  setMinutes,
  subDays,
  subHours,
} from "date-fns";
import BigNumber from "bignumber.js";

const TIME_RANGE_PARAMS = {
  [TimeRange.HOUR]: {
    dateFormatter: (date: Date) => format(date, "h:mm a"),
    generateTicks: (baseDate: Date) => {
      const start = subHours(baseDate, 1);
      return [
        start,
        addMinutes(start, 15),
        addMinutes(start, 30),
        addMinutes(start, 45),
        addMinutes(start, 60),
      ];
    },
  },
  [TimeRange.DAY]: {
    dateFormatter: (date: Date) => format(date, "d/M h:mm a"),
    generateTicks: (baseDate: Date) => {
      const start = subDays(baseDate, 1);
      return [
        start,
        addHours(start, 6),
        addHours(start, 12),
        addHours(start, 18),
        setMinutes(addHours(start, 23), 59),
      ];
    },
  },
  [TimeRange.MONTH]: {
    dateFormatter: (date: Date) => format(date, "d/m/yy"),
    generateTicks: (baseDate: Date) => {
      const start = subDays(baseDate, 30);
      return [
        start,
        addDays(start, 7),
        addDays(start, 15),
        addDays(start, 22),
        addDays(start, 30),
      ];
    },
  },
};

export const dateFormatter = (range: TimeRange, date: Date) => {
  return TIME_RANGE_PARAMS[range].dateFormatter(date);
};

export const getTooltipProps = (
  { active, label, payload }: VerticalBarChartTooltipInnerProps,
  {
    timeRange = TimeRange.HOUR,
    tooltipClassName,
  }: Pick<VerticalBarChartProps, "timeRange" | "tooltipClassName">,
) => {
  const [primaryData, secondaryData] = payload!;

  let { tooltipTitle } = primaryData.payload;

  if (!tooltipTitle) {
    tooltipTitle = dateFormatter
      ? dateFormatter(timeRange, label!)
      : String(label);
  }

  const primaryLabel = new BigNumber(primaryData.value!).toFormat();
  const secondaryLabel = new BigNumber(secondaryData.value!).toFormat();

  return {
    data: [
      {
        label: primaryLabel,
        fill: primaryData?.fill,
      },
      {
        label: secondaryLabel,
        fill: secondaryData?.fill,
      },
    ] as TooltipData,
    active,
    tooltipTitle,
    tooltipClassName,
  };
};

const EMPTY_TIME_RANGE_PROPS = {
  ticks: [],
  domain: [],
};

export const getTimeRangeProps = ({
  timeRange,
  baseStartDate,
}: Pick<VerticalBarChartProps, "timeRange" | "baseStartDate">) => {
  if (!timeRange) {
    return EMPTY_TIME_RANGE_PROPS;
  }
  const baseDate = baseStartDate || new Date();
  const timeRangeHandler = TIME_RANGE_PARAMS[timeRange];
  if (!timeRangeHandler) {
    return EMPTY_TIME_RANGE_PROPS;
  }
  const ticks = timeRangeHandler.generateTicks(baseDate);
  const domain = [ticks[0], ticks[ticks.length - 1]];
  return { ticks, domain };
};
