import { ReactNode } from "react";
import { Card, Heading5 } from "@stellar/design-system";

import "./styles.scss";

type Props = {
  title: string;
  titleIcon?: ReactNode;
  amount: string | number;
  amountBy?: string | number;
  amountPrefixContent?: ReactNode;
  description?: string;
};

export const AmountInfoCard = ({
  title,
  titleIcon,
  amount,
  amountBy,
  amountPrefixContent,
  description,
}: Props) => (
  <div className="AmountInfoCard">
    <Card noShadow>
      <div className="AmountInfoCard__card_title">
        {titleIcon}
        <div className="AmountInfoCard__card_title__title">{title}</div>
      </div>
      <div className="AmountInfoCard__content">
        {amountPrefixContent}
        <Heading5>
          {amount}
          {amountBy && (
            <span className="AmountInfoCard__content__amount_by">
              {amountBy}
            </span>
          )}
        </Heading5>
      </div>
      {description && (
        <div className="AmountInfoCard__description">{description}</div>
      )}
    </Card>
  </div>
);
