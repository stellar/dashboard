import { useCallback, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
  LegendProps,
} from "recharts";
import { fromUnixTime } from "date-fns";
import BigNumber from "bignumber.js";

import { Tooltip } from "components/charts/Tooltip";

import { VerticalBarShape } from "./VerticalBarShape";

import {
  AxisTickProps,
  LegendContentProps,
  TimeRange,
  VerticalBarChartProps,
  VerticalBarChartTooltipInnerProps,
} from "./types";

import { dateFormatter, getTimeRangeProps, getTooltipProps } from "./utils";

import "./styles.scss";

export const VerticalBarChart = ({
  data,
  tooltipClassName,

  primaryValueName,
  secondaryValueName,

  timeRange = TimeRange.HOUR,
  baseStartDate,
}: VerticalBarChartProps) => {
  const renderTooltip = useCallback(
    (props: VerticalBarChartTooltipInnerProps) => {
      if (!props.payload || props.payload.length < 2) {
        return null;
      }

      const tooltipProps = getTooltipProps(props, {
        tooltipClassName,
        timeRange,
      });

      return <Tooltip {...tooltipProps} />;
    },
    [timeRange, tooltipClassName],
  );

  const renderTickXAxis = useCallback(
    ({ x, y, payload, tickFormatter, index }: AxisTickProps) => {
      return (
        <text
          x={x}
          y={y}
          textAnchor="middle"
          className="VerticalBarChart__y_axis_tick"
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
        className="VerticalBarChart__y_axis_tick"
        textAnchor="end"
        fill="var(--pal-text-tertiary)"
      >
        {new BigNumber(payload.value).toFormat()}
      </text>
    ),
    [],
  );

  const renderLegendContent = useCallback(({ payload }: LegendContentProps) => {
    return (
      <div className="VerticalBarChart__legend">
        {payload?.map((entry, index) => (
          <div key={`item-${index}`} className="VerticalBarChart__legend__item">
            <span
              className="VerticalBarChart__legend__indicator"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }, []);

  const timeRangeData = useMemo(() => {
    return getTimeRangeProps({
      timeRange,
      baseStartDate,
    });
  }, [baseStartDate, timeRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        className="VerticalBarChart"
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
          padding={{ left: 50, right: 50 }}
          dataKey="date"
          tickLine={false}
        />
        {/* xaxis to show labels */}
        <XAxis
          padding={{ left: 25, right: 25 }}
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
        />
        <RechartsTooltip
          active
          allowEscapeViewBox={{ x: true, y: false }}
          cursor={false}
          offset={-5}
          content={renderTooltip as TooltipProps<number, string>["content"]}
        />
        <Legend
          verticalAlign="top"
          align="left"
          iconType="circle"
          iconSize={8}
          content={renderLegendContent as LegendProps["content"]}
        />
        <Bar
          dataKey="primaryValue"
          fill="var(--pal-graph-primary)"
          shape={(props) => <VerticalBarShape {...props} valueIndex={0} />}
          name={primaryValueName}
        />
        <Bar
          dataKey="secondaryValue"
          fill="var(--pal-graph-secondary)"
          shape={(props) => <VerticalBarShape {...props} valueIndex={1} />}
          name={secondaryValueName}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

VerticalBarChart.TimeRange = TimeRange;

export { TimeRange } from "./types";
