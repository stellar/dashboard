import { Icon } from "@stellar/design-system";
import BigNumber from "bignumber.js";

import { SectionCard } from "components/SectionCard";
import { DexCard } from "components/DexCard";
import { AmountInfoCard } from "components/AmountInfoCard";

import "./styles.scss";

export const ByTheNumbers = () => {
  // todo: get from redux state
  const data = {
    dex: {
      trades: {
        last24HR: new BigNumber(20000).toFormat(),
        overall: new BigNumber(40000).toFormat(),
        fluctuation: 1.4,
      },
      volume: {
        last24HR: new BigNumber(20000).toFormat(),
        overall: new BigNumber(40000).toFormat(),
        fluctuation: 2.8,
      },
    },
    totalUniqueAssets: new BigNumber(40000).toFormat(),
    dailyActiveAccounts: new BigNumber(40000).toFormat(),
    payments24HRs: new BigNumber(40000).toFormat(),
  };

  return (
    <SectionCard
      title="By the Numbers"
      titleLinkLabel="More stats"
      // TODO: update link
      titleLink="https://horizon.stellar.org/operations?order=desc&limit=20"
    >
      <div className="ByTheNumbers__dex_cards_container">
        <DexCard
          title="DEX TRADES"
          icon={<Icon.RefreshCcw width={16} height={16} />}
          last24HRValue={data.dex.trades.last24HR}
          overallValue={data.dex.trades.overall}
          fluctuation={data.dex.trades.fluctuation}
        />

        <DexCard
          title="DEX VOLUME"
          icon={<Icon.BarChart width={16} height={16} />}
          last24HRValue={`${data.dex.volume.last24HR} XLM`}
          overallValue={`${data.dex.volume.overall} XLM`}
          fluctuation={data.dex.volume.fluctuation}
        />
      </div>
      <div className="ByTheNumbers__amount_cards_container">
        <AmountInfoCard
          title="Total Unique Assets"
          titleIcon={<Icon.Database width={16} height={16} />}
          amount={data.totalUniqueAssets}
        />
        <AmountInfoCard
          title="Daily active accounts"
          titleIcon={<Icon.User width={16} height={16} />}
          amount={data.dailyActiveAccounts}
        />
        <AmountInfoCard
          title="24HR Payments"
          titleIcon={<Icon.ChevronsRight width={16} height={16} />}
          amount={data.payments24HRs}
        />
      </div>
    </SectionCard>
  );
};
