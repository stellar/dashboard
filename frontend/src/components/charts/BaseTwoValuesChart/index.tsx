import { useCallback, useMemo } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LegendProps,
  ReferenceLine,
  Label,
} from "recharts";
import { fromUnixTime } from "date-fns";
import BigNumber from "bignumber.js";

import { Tooltip } from "components/charts/Tooltip";
import { useMediaQuery } from "hooks/useMediaQuery";

import {
  AxisTickProps,
  LegendContentProps,
  TimeRange,
  BaseTwoValuesChartProps,
  BaseTwoValuesChartTooltipInnerProps,
} from "./types";

import { dateFormatter, getTimeRangeProps, getTooltipProps } from "./utils";

import "./styles.scss";

const X_AXIS_SMALL_PADDING = 25;
const X_AXIS_BIG_PADDING = 50;
const Y_AXIS_MIN_WIDTH = 60;
const Y_AXIS_WIDTH_MULTIPLIER_VALUE = 12;

/**
 * Base Two Values-Driven Chart component. It is used to display a chart with a series-based data.
 * The series should be an array of objects with at least the following properties:
 *
 * - date: Date - used for grouping the values
 * - primaryValue: number - used for the primary value (with color: `--pal-graph-primary`)
 * - secondaryValue: number - used for the secondary value (with color: `--pal-graph-secondary`)
 *
 * You also can pass a `TimeRange` prop, which says how the X-Axis labels will be showed. By default, it is `TimeRange.HOUR`.
 * Optionally, you can also pass a `baseStartDate` prop, which will be used also to calculate the X-Axis labels.
 *
 * P.S: This component is like a base for the AreaChart and the VerticalBarChart components. It was not meant
 * to be used directly. Instead, you should use one of the other components or create a new one.
 *
 * The width and height of the chart are based on the parent container, and the chart take 100% of the space.
 *
 * @see BaseTwoValuesChartProps
 */
export const BaseTwoValuesChart = ({
  data,
  tooltipClassName,
  timeRange = TimeRange.HOUR,
  baseStartDate,
  primaryValueOnly = false,
  maxLine = false,
  maxLineOffset = 0,
  children,
  xContentPaddingEnabled = false,
  primaryValueTooltipDescription,
  secondaryValueTooltipDescription,
  legendPosition = "top",
  legendAlign = "left",
  height = "100%",
}: BaseTwoValuesChartProps) => {
  const smallScreen = useMediaQuery("(max-width: 540px)");

  const contentPadding = useMemo(
    () => (smallScreen ? X_AXIS_SMALL_PADDING : X_AXIS_BIG_PADDING),
    [smallScreen],
  );

  const renderTooltip = useCallback(
    (props: BaseTwoValuesChartTooltipInnerProps) => {
      if (
        !props.payload ||
        (props.payload.length < 2 && !primaryValueOnly) ||
        (props.payload.length < 1 && primaryValueOnly)
      ) {
        return null;
      }

      const tooltipProps = getTooltipProps(props, {
        tooltipClassName,
        timeRange,
        primaryValueOnly,
        primaryValueTooltipDescription,
        secondaryValueTooltipDescription,
      });

      return <Tooltip {...tooltipProps} />;
    },
    [
      primaryValueOnly,
      timeRange,
      tooltipClassName,
      primaryValueTooltipDescription,
      secondaryValueTooltipDescription,
    ],
  );

  const renderTickXAxis = useCallback(
    ({ x, y, payload, tickFormatter, index }: AxisTickProps) => {
      return (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          className="BaseTwoValuesChart__y_axis_tick"
          fill="var(--pal-text-tertiary)"
        >
          {tickFormatter
            ? tickFormatter(payload.value, index)
            : String(payload.value)}
        </text>
      );
    },
    [],
  );

  const renderTickYAxis = useCallback(
    ({ x, y, payload }: AxisTickProps) => (
      <text
        x={x}
        y={y}
        className="BaseTwoValuesChart__y_axis_tick"
        textAnchor="end"
        fill="var(--pal-text-tertiary)"
      >
        {new BigNumber(payload.value).toFormat()}
      </text>
    ),
    [],
  );

  const renderLegendContent = useCallback(
    ({ payload }: LegendContentProps) => {
      return (
        <div
          className="BaseTwoValuesChart__legend"
          style={{
            marginTop: legendPosition === "bottom" ? "1rem" : 0,
            marginRight: legendPosition === "bottom" ? 0 : "1.2rem",
            height: legendPosition === "bottom" ? "1rem" : "2.5rem",
            justifyContent: legendAlign,
          }}
        >
          {payload?.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="BaseTwoValuesChart__legend__item"
            >
              <span
                className="BaseTwoValuesChart__legend__indicator"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    },
    [legendPosition, legendAlign],
  );

  const timeRangeData = useMemo(() => {
    return getTimeRangeProps({
      timeRange,
      baseStartDate,
    });
  }, [baseStartDate, timeRange]);

  const maxValue = useMemo(
    () =>
      Math.max(
        ...data.map((v) => v.primaryValue),
        ...(primaryValueOnly ? [] : data.map((v) => v.secondaryValue || 0)),
      ),
    [data, primaryValueOnly],
  );

  const yAxisWidth = useMemo(
    () =>
      Math.max(
        Y_AXIS_MIN_WIDTH,
        maxValue.toString().length * Y_AXIS_WIDTH_MULTIPLIER_VALUE,
      ),
    [maxValue],
  );

  const renderMaxLine = useMemo(() => {
    if (typeof maxLine === "number" || maxLine) {
      const maxLineValue = typeof maxLine === "number" ? maxLine : maxValue;
      const maxLineLabel = `Max: ${new BigNumber(maxLineValue).toFormat()}`;

      return (
        <ReferenceLine
          y={maxLineValue}
          stroke="var(--pal-brand-primary)"
          strokeWidth={2}
          strokeDasharray="5"
        >
          <Label className="BaseTwoValuesChart__max_label">
            {maxLineLabel}
          </Label>
        </ReferenceLine>
      );
    }

    return null;
  }, [maxLine, maxValue]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        className="BaseTwoValuesChart"
        data={data}
        barGap={0}
        barSize={4}
        barCategoryGap={4}
      >
        <CartesianGrid
          strokeDasharray="3"
          vertical={false}
          stroke="var(--pal-border-primary)"
        />
        {/* xaxis to add padding to graph container */}
        <XAxis
          hide
          padding={
            xContentPaddingEnabled
              ? { left: contentPadding, right: contentPadding }
              : undefined
          }
          dataKey="date"
          tickLine={false}
        />
        {/* xaxis to show labels */}
        <XAxis
          padding={{ left: X_AXIS_SMALL_PADDING, right: X_AXIS_SMALL_PADDING }}
          xAxisId="labelsTime"
          dataKey="date"
          interval="preserveStartEnd"
          stroke="var(--pal-border-primary)"
          tickLine={false}
          tickMargin={10}
          type="number"
          tick={renderTickXAxis}
          domain={timeRangeData.domain.map((date) => date.getTime())}
          tickFormatter={(unixTime) => {
            const date = fromUnixTime(unixTime / 1000);
            return dateFormatter(timeRange, date);
          }}
          ticks={timeRangeData.ticks.map((date) => date.getTime())}
        />
        <YAxis
          stroke="var(--pal-border-primary)"
          tickLine={false}
          tickMargin={10}
          tick={renderTickYAxis}
          domain={[0, maxLineOffset]}
          width={yAxisWidth}
        />
        <RechartsTooltip
          active
          allowEscapeViewBox={{ x: true, y: false }}
          cursor={false}
          offset={0}
          content={renderTooltip as TooltipProps<number, string>["content"]}
        />
        <Legend
          verticalAlign={legendPosition}
          iconType="circle"
          iconSize={8}
          content={renderLegendContent as LegendProps["content"]}
        />

        {children}
        {renderMaxLine}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

BaseTwoValuesChart.TimeRange = TimeRange;

export { TimeRange } from "./types";
