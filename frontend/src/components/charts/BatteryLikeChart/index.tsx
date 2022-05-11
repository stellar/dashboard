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
   * Gap between the bars. In pixels.
   *
   * @default 1
   */
  gap?: number;
};

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
