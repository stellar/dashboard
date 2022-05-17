import { useEffect, useMemo } from "react";
import { Icon } from "@stellar/design-system";
import BigNumber from "bignumber.js";
import { useDispatch } from "react-redux";

import { SectionCard } from "components/SectionCard";
import { DexCard } from "components/DexCard";
import { AmountInfoCard } from "components/AmountInfoCard";

import { useRedux } from "hooks/useRedux";
import { fetchDexDataAction } from "ducks/dex";
import { ActionStatus } from "types";

import "./styles.scss";

export const ByTheNumbers = () => {
  const { dex } = useRedux("dex");
  const { data } = dex;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchDexDataAction());
  }, [dispatch]);

  const dexData = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      dailyActiveAccounts: new BigNumber(data.dailyActiveAccounts).toFormat(),
      payments24HRs: new BigNumber(data.payments24HRs).toFormat(),
      totalUniqueAssets: new BigNumber(data.totalUniqueAssets).toFormat(),
      volume: {
        fluctuation: data.volume.fluctuation,
        overall: new BigNumber(data.volume.overall).toFormat(),
        last24HR: new BigNumber(data.volume.last24HR).toFormat(),
      },
      trades: {
        fluctuation: data.trades.fluctuation,
        overall: new BigNumber(data.trades.overall).toFormat(),
        last24HR: new BigNumber(data.trades.last24HR).toFormat(),
      },
    };
  }, [data]);

  return (
    <SectionCard
      title="By the Numbers"
      titleLinkLabel="More stats"
      // TODO: update link
      titleLink="https://horizon.stellar.org/operations?order=desc&limit=20"
      isLoading={dex.status === ActionStatus.PENDING}
      noData={!dexData}
    >
      {dexData && (
        <>
          <div className="ByTheNumbers__dex_cards_container">
            <DexCard
              title="DEX TRADES"
              icon={<Icon.RefreshCcw width={16} height={16} />}
              last24HRValue={dexData.trades.last24HR}
              overallValue={dexData.trades.overall}
              fluctuation={dexData.trades.fluctuation}
            />

            <DexCard
              title="DEX VOLUME"
              icon={<Icon.BarChart width={16} height={16} />}
              last24HRValue={`${dexData.volume.last24HR} XLM`}
              overallValue={`${dexData.volume.overall} XLM`}
              fluctuation={dexData.volume.fluctuation}
            />
          </div>
          <div className="ByTheNumbers__amount_cards_container">
            <AmountInfoCard
              title="Total Unique Assets"
              titleIcon={<Icon.Database width={16} height={16} />}
              amount={dexData.totalUniqueAssets}
            />
            <AmountInfoCard
              title="Daily active accounts"
              titleIcon={<Icon.User width={16} height={16} />}
              amount={dexData.dailyActiveAccounts}
            />
            <AmountInfoCard
              title="24HR Payments"
              titleIcon={<Icon.ChevronsRight width={16} height={16} />}
              amount={dexData.payments24HRs}
            />
          </div>
        </>
      )}
    </SectionCard>
  );
};
