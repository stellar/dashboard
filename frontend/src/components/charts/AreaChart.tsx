import { Area } from "recharts";

import { BaseTwoValuesChart } from "./BaseTwoValuesChart";
import { BaseTwoValuesChartProps } from "./BaseTwoValuesChart/types";

type AreaChartProps = Omit<BaseTwoValuesChartProps, "xContentPaddingEnabled">;

/**
 * Area Chart component. It is used to display a chart with a series-based data.
 *
 * @see {@link BaseTwoValuesChart} for more details on how this data and props work.
 */
export const AreaChart = ({
  primaryValueName,
  secondaryValueName,
  primaryValueOnly = false,
  ...props
}: AreaChartProps) => {
  return (
    <BaseTwoValuesChart primaryValueOnly={primaryValueOnly} {...props}>
      <Area
        type="monotone"
        dataKey="primaryValue"
        stroke="var(--pal-graph-primary)"
        fill="var(--pal-graph-primary)"
        name={primaryValueName}
        strokeWidth={2}
      />

      {!primaryValueOnly && (
        <Area
          type="monotone"
          dataKey="secondaryValue"
          stroke="var(--pal-graph-secondary)"
          fill="var(--pal-graph-secondary)"
          name={secondaryValueName}
          strokeWidth={2}
        />
      )}
    </BaseTwoValuesChart>
  );
};

AreaChart.TimeRange = BaseTwoValuesChart.TimeRange;

export const TimeRange = AreaChart.TimeRange;
