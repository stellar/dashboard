import { AreaChart as RechartsArea, Area, ResponsiveContainer } from "recharts";

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

export const AreaChart = ({ data }: Props) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsArea data={data}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="80%" stopColor="var(--pal-graph-gradient-primary)" />
            <stop
              offset="100%"
              stopColor="var(--pal-graph-gradient-secondary)"
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
