import { SVGProps } from "react";
import { XAxisProps } from "recharts";

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

export enum TimeRange {
  HOUR = "hour",
  DAY = "day",
  MONTH = "month",
}

export type VerticalBarChartProps = {
  data: VerticalBarChartData;
  /**
   * Custom CSS class name for the tooltip component.
   */
  tooltipClassName?: string;
  /**
   * Height of the chart. Could be in pixels, percentage or any other CSS property valid value.
   * If a number is provided, it will be treated as pixels.
   *
   * E.g. "100px" or "50%" or "10em" or "1rem" or "2vh" or 40
   */
  height: number | string;
  /**
   * Width of the chart. Could be in pixels, percentage or any other CSS property valid value.
   * If a number is provided, it will be treated as pixels.
   *
   * E.g. "100px" or "50%" or "10em" or "1rem" or "2vh" or 40
   */
  width: number | string;

  primaryValueName?: string;
  secondaryValueName?: string;

  timeRange?: TimeRange;
  baseStartDate?: Date;

  valueYAxisFormatter?: (value: number) => string;
  dateFormatter?: (date: Date) => string;
  primaryValueFormatter?: (value: number) => string;
  secondaryValueFormatter?: (value: number) => string;
};
