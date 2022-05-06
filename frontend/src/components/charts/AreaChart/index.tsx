import { AreaChart as RechartsArea, Area } from "recharts";

import "./styles.scss";

type Props = {
  data: {
    name: string;
    value: number;
  }[];
  width: number;
  height: number;
};

export const AreaChart = ({ data, width, height }: Props) => {
  return (
    <div className="AreaChart">
      <RechartsArea width={width} height={height} data={data}>
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
    </div>
  );
};
