import { ReactNode, useMemo } from "react";
import { Card, Heading4, Tag, Eyebrow } from "@stellar/design-system";

import "./styles.scss";

type Props = {
  title: string;
  icon: ReactNode;
  last24HRValue: string;
  overallValue: string;
  fluctuation: number;
};

export const DexCard = ({
  title,
  icon,
  overallValue,
  last24HRValue,
  fluctuation,
}: Props) => {
  const fluctuationLabel = useMemo(() => {
    const sign = fluctuation > 0 ? "+" : "";
    const label = `${sign}${fluctuation}%`;
    let variant = Tag.variant.warning;
    if (fluctuation > 0) {
      variant = Tag.variant.success;
    } else if (fluctuation < 0) {
      variant = Tag.variant.error;
    }

    return <Tag variant={variant}>{label}</Tag>;
  }, [fluctuation]);

  return (
    <div className="DexCard">
      <Card noShadow>
        <div className="DexCard__card_title">
          {icon}
          <div className="DexCard__card_title__title">{title}</div>
        </div>
        <div className="DexCard__last_info">
          <div>Last 24HR</div>
          <div className="DexCard__last_info__content">
            <div>
              <Heading4>{last24HRValue}</Heading4>
            </div>
            {fluctuationLabel}
          </div>
        </div>
        <div className="DexCard__overall_info">
          <div className="DexCard__overall_info__label">Overall</div>
          <Eyebrow>{overallValue}</Eyebrow>
        </div>
      </Card>
    </div>
  );
};
