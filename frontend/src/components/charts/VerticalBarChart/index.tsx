import { Bar } from "recharts";

import { VerticalBarShape } from "./VerticalBarShape";

import { BaseTwoValuesChart } from "../BaseTwoValuesChart";
import { BaseTwoValuesChartProps } from "../BaseTwoValuesChart/types";

type VerticalBarChartProps = Omit<
  BaseTwoValuesChartProps,
  "xContentPaddingEnabled"
>;

/**
 * Vertical Bar Chart component. It is used to display a chart with a series-based data.
 *
 * @see {@link BaseTwoValuesChart} for more details on how this data and props work.
 */
export const VerticalBarChart = ({
  primaryValueName,
  secondaryValueName,
  primaryValueOnly = false,
  ...props
}: VerticalBarChartProps) => {
  return (
    <BaseTwoValuesChart
      primaryValueOnly={primaryValueOnly}
      xContentPaddingEnabled
      {...props}
    >
      <>
        <Bar
          dataKey="primaryValue"
          fill="var(--pal-graph-primary)"
          shape={(props) => <VerticalBarShape {...props} valueIndex={0} />}
          name={primaryValueName}
        />
        {!primaryValueOnly && (
          <Bar
            dataKey="secondaryValue"
            fill="var(--pal-graph-secondary)"
            shape={(props) => <VerticalBarShape {...props} valueIndex={1} />}
            name={secondaryValueName}
          />
        )}
      </>
    </BaseTwoValuesChart>
  );
};

VerticalBarChart.TimeRange = BaseTwoValuesChart.TimeRange;

export const TimeRange = VerticalBarChart.TimeRange;
