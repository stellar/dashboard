import { useCallback, useMemo } from "react";
import { PieChart, Pie, Tooltip } from "recharts";
import { Icon } from "@stellar/design-system";

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
  size: number;
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
  colorType,
  size,
  tooltipEnabled,
  tooltipClassName,
  tooltipTitle,
  lineWidth,
}: Props) => {
  const data = useMemo(
    () => [
      {
        ...dataProp[0],
        fill: CircularChartColors[colorType || CircularChartColorType.PRIMARY]
          .primary,
      },
      {
        ...dataProp[1],
        fill: CircularChartColors[colorType || CircularChartColorType.PRIMARY]
          .secondary,
      },
    ],
    [dataProp, colorType],
  );

  const renderTooltip = useCallback(
    ({ active }: { active?: boolean }) => {
      if (active) {
        return (
          <div
            className={`CircularChart__custom-tooltip ${
              tooltipClassName ?? ""
            }`}
          >
            <Icon.Triangle className="CircularChart__custom-tooltip__arrow" />
            <div className="CircularChart__custom-tooltip__content">
              {tooltipTitle && (
                <div className="CircularChart__custom-tooltip__content__title">
                  {tooltipTitle}
                </div>
              )}
              {data.map((entry: any) => (
                <div className="CircularChart__custom-tooltip__content__row">
                  <div
                    className="CircularChart__custom-tooltip__content__row__circle"
                    style={{
                      backgroundColor: entry.fill,
                    }}
                  ></div>
                  <div>{entry.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return null;
    },
    [data, tooltipClassName, tooltipTitle],
  );

  const innerRadius = useMemo(() => {
    const value = lineWidth || DEFAULT_LINE_WIDTH_PERCENTAGE;
    const basePercentage = BASE_LINE_WIDTH_PERCENTAGE * 100;
    return basePercentage * (1 - value);
  }, [lineWidth]);
  const filled = useMemo(() => innerRadius === 0, [innerRadius]);

  return (
    <PieChart className="CircularChart" width={size} height={size}>
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
        <Tooltip
          position={{ x: size * 0.9, y: size * 0.5 }}
          content={renderTooltip}
        />
      )}
    </PieChart>
  );
};

CircularChart.defaultProps = {
  colorType: CircularChartColorType.PRIMARY,
  tooltipEnabled: true,
  lineWidth: DEFAULT_LINE_WIDTH_PERCENTAGE,
};

CircularChart.ColorType = CircularChartColorType;
