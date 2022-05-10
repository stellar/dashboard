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
import { Tooltip } from "components/charts/Tooltip";

import { VerticalBarShape } from "./VerticalBarShape";

import {
  AxisTickProps,
  LegendContentProps,
  TimeRange,
  VerticalBarChartProps,
  VerticalBarChartTooltipInnerProps,
} from "./types";
import { getTimeRangeProps, getTooltipProps } from "./utils";

import "./styles.scss";

export const VerticalBarChart = ({
  data,
  width,
  height,
  tooltipClassName,

  primaryValueName,
  secondaryValueName,

  timeRange,
  baseStartDate,

  valueYAxisFormatter,
  dateFormatter,
  primaryValueFormatter,
  secondaryValueFormatter,
}: VerticalBarChartProps) => {
  const renderTooltip = useCallback(
    (props: VerticalBarChartTooltipInnerProps) => {
      if (!props.payload || props.payload.length < 2) {
        return null;
      }

      const tooltipProps = getTooltipProps(props, {
        tooltipClassName,
        secondaryValueFormatter,
        primaryValueFormatter,
        dateFormatter,
      });

      return <Tooltip {...tooltipProps} />;
    },
    [
      dateFormatter,
      primaryValueFormatter,
      secondaryValueFormatter,
      tooltipClassName,
    ],
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
        {valueYAxisFormatter
          ? valueYAxisFormatter(payload.value)
          : String(payload.value)}
      </text>
    ),
    [valueYAxisFormatter],
  );

  const renderLegendContent = useCallback(({ payload }: LegendContentProps) => {
    return (
      <div className="VerticalBarChart__legend">
        {payload?.map((entry, index) => (
          <div key={`item-${index}`} className="VerticalBarChart__legend__item">
            <span
              className="VerticalBarChart__legend__indicator"
              style={{ backgroundColor: entry.color }}
            >
              {" "}
            </span>
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
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        className="VerticalBarChart"
        width={400}
        height={200}
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
        <XAxis
          hide
          padding={{ left: 50, right: 50 }}
          dataKey="date"
          tickLine={false}
        />
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
            if (dateFormatter) {
              return dateFormatter(date);
            }
            return date.toISOString();
          }}
          ticks={timeRangeData.ticks.map((date) => date.getTime())}
          hide={!timeRange}
        />
        <XAxis
          padding={{ left: 25, right: 25 }}
          dataKey="date"
          xAxisId="labels"
          tickFormatter={(date: Date) =>
            dateFormatter ? dateFormatter(date) : String(date)
          }
          interval="preserveStartEnd"
          stroke="var(--pal-border-primary)"
          tickLine={false}
          tickMargin={10}
          tick={renderTickXAxis}
          hide={!!timeRange}
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
