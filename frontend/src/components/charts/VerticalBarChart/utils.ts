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

/**
 * Time range related properties. It's a map to help get the parameters
 * based on the TimeRange enum.
 *
 * The parameters are:
 * - dateFormatter: function to, given a date, return a string with a formatted date
 * - generateTicks: function to, given a based date, generate the 5 ticks to be used
 */
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
    dateFormatter: (date: Date) => format(date, "d/M/yy"),
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

/**
 * Helper function to get the date formatter based on the TimeRange
 *
 * @param {TimeRange} range - TimeRange to get the date formatter for
 * @param {Date} date - Date to be formatted
 * @returns {string} - Formatted date
 */
export const dateFormatter = (range: TimeRange, date: Date) => {
  return TIME_RANGE_PARAMS[range].dateFormatter(date);
};

/**
 * Helper function to get the props to be used in the tooltip component.
 *
 * It gets the props from the default Recharts Tooltip component, and the `TimeRange` and
 * `tooltipClassName` props.
 *
 * It returns an object containing the props to be used in the ChartTooltip component (our Tooltip, not Recharts' one).
 *
 * @see {@link https://recharts.org/en-US/api/Tooltip}
 * @see VerticalBarChartProps.timeRange
 * @see VerticalBarChartProps.tooltipClassName
 */
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

/**
 * Helper function to get the ticks and domain based on the TimeRange
 * @param params - An object containing the TimeRange to get the ticks and domain for,
 *            and the base start date to generate the ticks
 *
 * @returns An object containing the attribute `ticks`, which is an Array/Tuple of 5 ticks (dates),
 *      and the attribute `domain`, which is a Tuple of 2 dates - the start and the end of the domain
 *
 * @see VerticalBarChartProps.timeRange
 * @see VerticalBarChartProps.baseStartDate
 */
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
