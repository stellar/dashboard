import { ReactNode, SVGProps } from "react";
import { XAxisProps } from "recharts";

/**
 * Item for the BaseTwoValuesChart data
 *
 * @prop {Date} date - X-Axis value - Used to group bars
 * @prop {number} primaryValue - Y-Axis primary value
 * @prop {number} secondaryValue - Y-Axis secondary value
 * @prop {string} [tooltipTitle] - It will be used as
 *    the tooltip title for the group of values. If not provided,
 *    the title will be the date of the group.
 * @prop {string} [tooltipSubtitle] - It will be used as
 *    the tooltip subtitle for the group of bars.
 */
export type BaseTwoValuesChartItem = {
  tooltipTitle?: string;
  tooltipSubtitle?: string;
  date: Date;
  primaryValue: number;
  secondaryValue?: number;
};

export type BaseTwoValuesChartData = BaseTwoValuesChartItem[];

export type ChartItemPayload = {
  value: number;
  fill: string;
  payload: BaseTwoValuesChartItem;
};

export type BaseTwoValuesChartTooltipInnerProps = {
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
 * Enum for time range of BaseTwoValuesChart.
 */
export enum TimeRange {
  HOUR = "hour",
  DAY = "day",
  MONTH = "month",
}

/**
 * @see BaseTwoValuesChartProps.data
 * @see BaseTwoValuesChartProps.tooltipClassName
 * @see BaseTwoValuesChartProps.timeRange
 * @see BaseTwoValuesChartProps.baseStartDate
 * @see BaseTwoValuesChartProps.primaryValueOnly
 * @see BaseTwoValuesChartProps.children
 * @see BaseTwoValuesChartProps.maxLine
 * @see BaseTwoValuesChartProps.maxLineOffset
 * @see BaseTwoValuesChartProps.xContentPaddingEnabled
 */
export type BaseTwoValuesChartProps = {
  /**
   * Data to be displayed in the chart.
   *
   * Should be an array of objects with the following properties:
   *
   * - date
   * - primaryValue
   * - secondaryValue
   * - tooltipTitle
   * - tooltipSubtitle
   *
   * @see BaseTwoValuesChartItem
   */
  data: BaseTwoValuesChartData;
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
   * Description to be concatenated with the primary value inside the tooltip.
   */
  primaryValueTooltipDescription?: string;
  /**
   * Name/Label of the secondary value, to be showed on the Legend. If not provided,
   * it will show `secondaryValue`.
   */
  secondaryValueName?: string;
  /**
   * Description to be concatenated with the secondary value inside the tooltip.
   */
  secondaryValueTooltipDescription?: string;
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
  /**
   * Flag that says if we should use just the primary value to render the bars.
   */
  primaryValueOnly?: boolean;
  /**
   * Content of the chart. Should be composed by Recharts components.
   */
  children?: ReactNode;
  /**
   * If the "max line" should be rendered. It can be a boolean, or a number. If `true`,
   * the max line value will be the max value of the chart, calculated from `primaryValue`
   * and `secondaryValue`. If a number is provided, it will be used as the max line value.
   *
   * @default false
   */
  maxLine?: number | boolean;
  /**
   * Offset to apply to the top of max line. It has impact on the data domain of Y-Axis.
   *
   * @default 0
   */
  maxLineOffset?: number;
  /**
   * If the X-Axis should have a padding or not, useful to avoid unwanted spacing on
   * area charts.
   *
   * @default false
   */
  xContentPaddingEnabled?: boolean;
};
