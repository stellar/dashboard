import { Icon } from "@stellar/design-system";

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
      <div className={["CustomTooltip", tooltipClassName].join(" ")}>
        <Icon.Triangle className="CustomTooltip__arrow" />
        <div className="CustomTooltip__content">
          {tooltipTitle && (
            <div className="CustomTooltip__content__title">{tooltipTitle}</div>
          )}
          {data.map((entry: any) => (
            <div key={entry.label} className="CustomTooltip__content__row">
              <div
                className="CustomTooltip__content__row__circle"
                style={{
                  backgroundColor: entry.fill,
                }}
              ></div>
              <div>{entry.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
