import { SVGProps } from "react";
import { XAxisProps } from "recharts";

/**
 * Item for the VerticalBarChart data
 *
 * @prop {Date} date - X-Axis value - Used to group bars
 * @prop {number} primaryValue - Y-Axis primary bar value
 * @prop {number} secondaryValue - Y-Axis secondary bar value
 * @prop {string} [tooltipTitle] - It will be used as
 *    the tooltip title for the group of bars. If not provided,
 *    the title will be the date of the group.
 */
export type VerticalBarChartDataItem = {
  tooltipTitle?: string;
  date: Date;
  primaryValue: number;
  secondaryValue: number;
};

export type VerticalBarChartData = VerticalBarChartDataItem[];

export type ChartItemPayload = {
  value: number;
  fill: string;
  payload: VerticalBarChartDataItem;
};

export type VerticalBarChartTooltipInnerProps = {
  active?: boolean;
  label?: Date;
  payload?: ChartItemPayload[];
};

export type AxisTickProps = SVGProps<SVGTextElement> & {
  payload: ChartItemPayload;
  tickFormatter: XAxisProps["tickFormatter"];
  index: number;
};

export type LegendContentProps = {
  payload: { value: string; color: string }[];
};

/**
 * Enum for time range of VerticalBarChart.
 */
export enum TimeRange {
  HOUR = "hour",
  DAY = "day",
  MONTH = "month",
}

export type VerticalBarChartProps = {
  /**
   * Data to be displayed in the chart.
   *
   * Should be an array of objects with the following properties:
   *
   * - date
   * - primaryValue
   * - secondaryValue
   * - tooltipTitle
   *
   * @see VerticalBarChartDataItem
   */
  data: VerticalBarChartData;
  /**
   * Custom CSS class name for the tooltip component.
   */
  tooltipClassName?: string;
  /**
   * Name/Label of the primary value, to be showed on the Legend. If not provided,
   * it will show `primaryValue`.
   */
  primaryValueName?: string;
  /**
   * Name/Label of the secondary value, to be showed on the Legend. If not provided,
   * it will show `secondaryValue`.
   */
  secondaryValueName?: string;
  /**
   * Time range to be used to format the X-Axis ticks.
   * Can be one of the following:
   *
   * - `TimeRange.HOUR` - Will use an interval of 1 hour, and render with format: `2:00 pm` - This is the default
   * - `TimeRange.DAY` - Will use an interval of 1 day, and render with format: `30/12 2:00 pm`
   * - `TimeRange.MONTH` - Will use an interval of 1 month, and render with format: `30/12/20`
   *
   * The interval will use the `baseStartDate` prop to calculate the ticks, or, if it is not provided,
   * it will use the date when the chart is being rendered (`new Date()`).
   *
   * @default TimeRange.HOUR
   */
  timeRange?: TimeRange;
  /**
   * Date to be used as the base for the X-Axis ticks.
   */
  baseStartDate?: Date;
};
