import { useCallback, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Tooltip, TooltipData } from "components/charts/Tooltip";

import "./styles.scss";

export type CircularChartDataItem = {
  label: string;
  value: number;
};

export type CircularChartData = [CircularChartDataItem, CircularChartDataItem];

enum CircularChartColorType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

const CircularChartColors = {
  [CircularChartColorType.PRIMARY]: {
    primary: "var(--pal-graph-primary)",
    secondary: "var(--pal-graph-secondary)",
  },
  [CircularChartColorType.SECONDARY]: {
    primary: "var(--pal-success)",
    secondary: "var(--pal-error)",
  },
};

const BASE_LINE_WIDTH_PERCENTAGE = 0.8;
const DEFAULT_LINE_WIDTH_PERCENTAGE = 0.25;

type Props = {
  data: CircularChartData;
  colorType?: CircularChartColorType;
  tooltipEnabled?: boolean;
  tooltipClassName?: string;
  tooltipTitle?: string;
  /**
   * It should be in percentage, between 0 and 1. 1 means that the chart is totally filled (like a common PieChart).
   * Anything less than 1 means the width of the line, based on its size (like a common CircularChart).
   *
   * @default 0.25
   */
  lineWidth?: number;
};

export const CircularChart = ({
  data: dataProp,
  colorType = CircularChartColorType.PRIMARY,
  tooltipEnabled = true,
  tooltipClassName,
  tooltipTitle,
  lineWidth = DEFAULT_LINE_WIDTH_PERCENTAGE,
}: Props) => {
  const [size, setSize] = useState({ x: 0, y: 0 });
  const data = useMemo(
    () => [
      {
        ...dataProp[0],
        fill: CircularChartColors[colorType].primary,
      },
      {
        ...dataProp[1],
        fill: CircularChartColors[colorType].secondary,
      },
    ],
    [dataProp, colorType],
  );

  const renderTooltip = useCallback(
    ({ active }: { active?: boolean }) => {
      return (
        <Tooltip
          data={
            data.map((a) => ({ label: a.label, fill: a.fill })) as TooltipData
          }
          active={active}
          tooltipClassName={["CircularChart__tooltip", tooltipClassName].join(
            " ",
          )}
          tooltipTitle={tooltipTitle}
        />
      );
    },
    [data, tooltipClassName, tooltipTitle],
  );

  const innerRadius = useMemo(() => {
    const value = lineWidth;
    const basePercentage = BASE_LINE_WIDTH_PERCENTAGE * 100;
    return basePercentage * (1 - value);
  }, [lineWidth]);
  const filled = useMemo(() => innerRadius === 0, [innerRadius]);

  const getSizeByRef = useCallback(
    (ref: { container?: HTMLDivElement } | null) => {
      if (ref) {
        if (ref.container) {
          if (
            ref.container.clientWidth !== size.x ||
            ref.container.clientHeight !== size.y
          ) {
            setSize({
              x: ref.container.clientWidth,
              y: ref.container.clientHeight,
            });
          }
        }
      }
    },
    [size],
  );

  return (
    <ResponsiveContainer width="100%" height="100%" aspect={1}>
      <PieChart
        className="CircularChart"
        ref={getSizeByRef}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={`${innerRadius}%`}
          outerRadius={`${BASE_LINE_WIDTH_PERCENTAGE * 100}%`}
          paddingAngle={filled ? 0 : 4}
          stroke="transparent"
          // makes the chart start from the top in anticlockwise
          startAngle={90}
          endAngle={360 + 90}
        />
        {!filled && (
          <Pie
            data={[{ name: "placeholder", value: 100 }]}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="59%"
            fill="transparent"
            stroke="transparent"
          />
        )}
        {tooltipEnabled && (
          <RechartsTooltip
            allowEscapeViewBox={{ x: true, y: false }}
            position={{ x: size.x * 0.85, y: size.y * 0.5 }}
            content={renderTooltip}
            cursor={false}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

CircularChart.ColorType = CircularChartColorType;
