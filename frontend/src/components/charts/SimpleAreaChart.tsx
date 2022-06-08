import { AreaChart as RechartsArea, Area, ResponsiveContainer } from "recharts";

type Props = {
  /**
   * The data to be displayed in the chart.
   */
  data: {
    name: string;
    value: number;
  }[];
};

/**
 * Simple Area chart component. It is used to display a chart with a series-based data.
 * The series should be an array of objects with the following properties:
 *
 * - name: string
 * - value: number
 *
 * This chart does not render X-Axis, Y-Axis, Legend, or Tooltip.
 *
 * The width and height of the chart are based on the parent container, and the chart take 100% of the space.
 */
export const SimpleAreaChart = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsArea data={data}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="80%"
              stopColor="var(--pal-graph-gradient-primary)"
              stopOpacity={0.1}
            />
            <stop
              offset="100%"
              stopColor="var(--pal-graph-gradient-secondary)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <Area
          stroke="var(--pal-graph-primary)"
          strokeOpacity={0.6}
          strokeWidth={1.5}
          type="monotone"
          dataKey="value"
          fill="url(#colorGradient)"
        />
      </RechartsArea>
    </ResponsiveContainer>
  );
};
