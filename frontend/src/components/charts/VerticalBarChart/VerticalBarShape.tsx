import { SVGProps, useMemo } from "react";

type VerticalBarShapeProps = SVGProps<SVGElement> & {
  valueIndex: number;
  index?: number;
  height: number;
};

const BASE_BAR_RADIUS = 1;

export const VerticalBarShape = ({
  fill,
  x,
  y,
  width,
  height,
  index,
  valueIndex,
}: VerticalBarShapeProps) => {
  const id = useMemo(
    () => `round-corner-${valueIndex}-${index}`,
    [index, valueIndex],
  );

  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height + BASE_BAR_RADIUS}
            rx={BASE_BAR_RADIUS}
            ry={BASE_BAR_RADIUS}
          />
        </clipPath>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        clipPath={`url(#${id})`}
        fill={fill}
      ></rect>
    </>
  );
};
