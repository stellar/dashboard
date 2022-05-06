import "./styles.scss";
import { useMemo } from "react";

type Props = {
  /**
   * Data to be displayed in the chart. Should be in percentage, like a phone battery.
   *
   * E.g. 80
   */
  value: number;
  /**
   * Height of the chart. Could be in pixels, percentage or any other CSS property valid value.
   * If a number is provided, it will be treated as pixels.
   *
   * E.g. "100px" or "50%" or "10em" or "1rem" or "2vh" or 40
   */
  height: number | string;
  /**
   * Width of the chart. Could be in pixels, percentage or any other CSS property valid value.
   * If a number is provided, it will be treated as pixels.
   *
   * E.g. "100px" or "50%" or "10em" or "1rem" or "2vh" or 40
   */
  width: number | string;
  /**
   * Gap between the bars. In pixels.
   *
   * @default 1
   */
  gap?: number;
};

export const BatteryLikeChart = ({
  value: valueProp,
  height,
  width,
  gap: gapProp,
}: Props) => {
  const value = useMemo(
    () => Math.max(0, Math.min(100, valueProp)),
    [valueProp],
  );
  const gap = useMemo(() => gapProp || 0, [gapProp]);
  const restValue = useMemo(() => 100 - value, [value]);
  const filled = useMemo(() => value === 100, [value]);

  return (
    <div
      className="BatteryLikeChart"
      style={{
        height: `calc(${height}${
          typeof height === "number" ? "px" : ""
        } + ${gap}px)`,
        width,
      }}
    >
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

BatteryLikeChart.defaultProps = {
  radius: 2,
  gap: 1,
};
