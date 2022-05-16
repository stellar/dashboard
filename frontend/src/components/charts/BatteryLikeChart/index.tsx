import { useMemo } from "react";

import "./styles.scss";

type Props = {
  /**
   * Data to be displayed in the chart. Should be in percentage, like a phone battery.
   * Should not be more than 100% or less than 0%.
   *
   * E.g. `80` will display a green content taking 80% of the container height, with the
   * rest being filled by a gray container.
   */
  value: number;
  /**
   * Gap between the green bar and the gray container. In pixels.
   *
   * @default 1
   */
  gap?: number;
};

/**
 * A Battery-like chart component. It is used to display a chart like a battery, based on
 * a percentage data.
 *
 * This chart does not render X-Axis, Y-Axis, Legend, or Tooltip.
 *
 * The width and height of the chart are based on the parent container, and the chart take 100% of the space.
 */
export const BatteryLikeChart = ({
  value: valueProp,
  gap: gapProp = 1,
}: Props) => {
  const value = useMemo(
    () => Math.max(0, Math.min(100, valueProp)),
    [valueProp],
  );
  const gap = useMemo(() => gapProp || 0, [gapProp]);
  const restValue = useMemo(() => 100 - value, [value]);
  const filled = useMemo(() => value === 100, [value]);

  return (
    <div className="BatteryLikeChart">
      {!filled && (
        <div
          className="BatteryLikeChart__rest"
          style={{
            height: `${restValue}%`,
            marginBottom: gap / 2,
          }}
        ></div>
      )}
      <div
        className={`BatteryLikeChart__value ${
          filled ? "BatteryLikeChart__value__filled" : ""
        }`}
        style={{
          height: `${value}%`,
          marginTop: !filled ? gap / 2 : 0,
        }}
      ></div>
    </div>
  );
};
