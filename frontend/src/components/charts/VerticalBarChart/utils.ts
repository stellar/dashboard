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
  setMinutes,
  subDays,
  subHours,
} from "date-fns";

export const getTooltipProps = (
  { active, label, payload }: VerticalBarChartTooltipInnerProps,
  {
    dateFormatter,
    primaryValueFormatter,
    secondaryValueFormatter,
    tooltipClassName,
  }: Pick<
    VerticalBarChartProps,
    | "dateFormatter"
    | "primaryValueFormatter"
    | "secondaryValueFormatter"
    | "tooltipClassName"
  >,
) => {
  const [primaryData, secondaryData] = payload!;

  let { tooltipTitle } = primaryData.payload;

  if (!tooltipTitle) {
    tooltipTitle = dateFormatter ? dateFormatter(label!) : String(label);
  }

  const primaryLabel = primaryValueFormatter
    ? primaryValueFormatter(primaryData.value!)
    : String(primaryData?.value);

  const secondaryLabel = secondaryValueFormatter
    ? secondaryValueFormatter(secondaryData?.value)
    : String(secondaryData?.value);

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

const TIME_RANGE_TICKS_HANDLERS = {
  [TimeRange.HOUR]: (baseDate: Date) => {
    const start = subHours(baseDate, 1);
    return [
      start,
      addMinutes(start, 15),
      addMinutes(start, 30),
      addMinutes(start, 45),
      addMinutes(start, 60),
    ];
  },
  [TimeRange.DAY]: (baseDate: Date) => {
    const start = subDays(baseDate, 1);
    return [
      start,
      addHours(start, 6),
      addHours(start, 12),
      addHours(start, 18),
      setMinutes(addHours(start, 23), 59),
    ];
  },
  [TimeRange.MONTH]: (baseDate: Date) => {
    const start = subDays(baseDate, 30);
    return [
      start,
      addDays(start, 7),
      addDays(start, 15),
      addDays(start, 22),
      addDays(start, 30),
    ];
  },
};

export const getTimeRangeProps = ({
  timeRange,
  baseStartDate,
}: Pick<VerticalBarChartProps, "timeRange" | "baseStartDate">) => {
  if (!timeRange) {
    return EMPTY_TIME_RANGE_PROPS;
  }
  const baseDate = baseStartDate || new Date();
  const timeRangeHandler = TIME_RANGE_TICKS_HANDLERS[timeRange];
  if (!timeRangeHandler) {
    return EMPTY_TIME_RANGE_PROPS;
  }
  const ticks = timeRangeHandler(baseDate);
  const domain = [ticks[0], ticks[ticks.length - 1]];
  return { ticks, domain };
};
