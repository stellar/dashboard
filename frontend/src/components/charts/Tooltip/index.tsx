import { Tooltip as StellarTooltip } from "@stellar/design-system";

import "./styles.scss";

type TooltipDataItem = {
  label: string;
  fill: string;
};

export type TooltipData = [TooltipDataItem, TooltipDataItem];

type Props = {
  tooltipClassName?: string;
  tooltipTitle?: string;
  active?: boolean;
  data: TooltipData;
};

export const Tooltip = ({
  active,
  tooltipTitle,
  tooltipClassName,
  data,
}: Props) => {
  if (active) {
    return (
      <div className={["ChartTooltip", tooltipClassName].join(" ")}>
        <StellarTooltip
          isVisible={active}
          content={
            <div className="ChartTooltip__content">
              {tooltipTitle && (
                <div className="ChartTooltip__content__title">
                  {tooltipTitle}
                </div>
              )}
              {data.map((entry) => (
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
