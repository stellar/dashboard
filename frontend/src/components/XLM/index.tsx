import { useMemo } from "react";
import BigNumber from "bignumber.js";

import { useRedux } from "hooks/useRedux";
import { AmountInfoCard } from "components/AmountInfoCard";
import { SectionCard } from "components/SectionCard";
import { formatBigNumbers } from "helpers/formatBigNumbers";

import "./styles.scss";

export const XLM = () => {
  const { feeStats } = useRedux("feeStats");

  const data = useMemo(() => {
    if (feeStats.fees?.month) {
      const daysInMonth = feeStats.fees.month.length;
      const feesResults = feeStats.fees.month.reduce((acc, currentValue) => {
        acc += Number(currentValue.primaryValue);
        return acc;
      }, 0);

      const average = String(feesResults / daysInMonth);
      const formattedAverage = formatBigNumbers(
        new BigNumber(average).toFormat(2),
      );

      return `${formattedAverage} XLM`;
    }

    return "0 XLM";
  }, [feeStats.fees?.month]);

  return (
    <SectionCard title="XLM">
      <div className="XLMContainer">
        <AmountInfoCard title="Average Transaction Fee" amount={data} />

        <AmountInfoCard title="Base operation fee" amount="0.00001 XLM" />

        <AmountInfoCard title="Base reserve" amount="0.5 XLM" />
      </div>
    </SectionCard>
  );
};
