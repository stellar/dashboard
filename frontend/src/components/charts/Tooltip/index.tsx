import { Tooltip as StellarTooltip } from "@stellar/design-system";

import "./styles.scss";

type TooltipDataItem = {
  label: string;
  fill: string;
};

export type TooltipData = [TooltipDataItem, TooltipDataItem];

type Props = {
  /**
   * A custom CSS class name to be applied on the component.
   */
  tooltipClassName?: string;
  /**
   * The title to be rendered on the top of the tooltip.
   */
  tooltipTitle?: string;
  /**
   * If the tooltip is visible or not.
   */
  active?: boolean;
  /**
   * The data to be displayed in the tooltip.
   */
  data: TooltipData;
};

/**
 * Chart tooltip component. It is based on default `Tooltip` component from
 * [Stellar Design System](https://design-system.stellar.org/component/tooltips).
 * It renders a placeholder to trigger the tooltip, and should be used together with the default
 * `Tooltip` component from Recharts library.
 *
 * The `data` prop should be an array of two positions, containing the label and the fill color.
 *
 * It will return `null` if the `active` prop is `false`.
 *
 * @see {@link https://recharts.org/en-US/api/Tooltip}
 */
export const Tooltip = ({
  active,
  tooltipTitle,
  tooltipClassName,
  data,
}: Props) => {
  if (active) {
    return (
      <div className={["ChartTooltip", tooltipClassName || ""].join(" ")}>
        <StellarTooltip
          isVisible={active}
          content={
            <div className="ChartTooltip__content">
              {tooltipTitle && (
                <div className="ChartTooltip__content__title">
                  {tooltipTitle}
                </div>
              )}
              {data
                .filter((entry) => !!entry)
                .map((entry) => (
                  <div key={entry.label} className="ChartTooltip__content__row">
                    <div
                      className="ChartTooltip__content__row__circle"
                      style={{
                        backgroundColor: entry.fill,
                      }}
                    ></div>
                    <div>{entry.label}</div>
                  </div>
                ))}
            </div>
          }
          position={StellarTooltip.position.RIGHT}
        >
          <div className="ChartTooltip__placeholder">-</div>
        </StellarTooltip>
      </div>
    );
  }

  return null;
};
