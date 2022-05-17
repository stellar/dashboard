import { SVGProps, useMemo } from "react";

type VerticalBarShapeProps = SVGProps<SVGElement> & {
  valueIndex: number;
  index?: number;
  height: number;
};

const BASE_BAR_RADIUS = 1;

/**
 * This is a component used to render a vertical bar shape. It should be a different component
 * because we want to add border radius just on top of the bars, and we need to do this with svg.
 * The unique required custom prop is `valueIndex` which is used to help identify the bar.
 * The other props are from SVGProps, and should be gotten directly from Recharts.
 */
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
