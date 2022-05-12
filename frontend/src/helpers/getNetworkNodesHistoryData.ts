import { NetworkNodeItemData, NetworkNodesType } from "types";

type StatisticsResponseItem = {
  time: Date;
  nrOfActiveWatchersSum: number;
  nrOfActiveValidatorsSum: number;
  nrOfActiveFullValidatorsSum: number;
  nrOfActiveOrganizationsSum: number;
  transitiveQuorumSetSizeSum: number;
  hasQuorumIntersectionCount: number;
  hasTransitiveQuorumSetCount: number;
  hasSymmetricTopTierCount: number;
  topTierMin: number;
  topTierMax: number;
  topTierSum: number;
  topTierOrgsMin: number;
  topTierOrgsMax: number;
  topTierOrgsSum: number;
  minBlockingSetMin: number;
  minBlockingSetMax: number;
  minBlockingSetSum: number;
  minBlockingSetOrgsMin: number;
  minBlockingSetOrgsMax: number;
  minBlockingSetOrgsSum: number;
  minBlockingSetFilteredMin: number;
  minBlockingSetFilteredMax: number;
  minBlockingSetFilteredSum: number;
  minBlockingSetOrgsFilteredMin: number;
  minBlockingSetOrgsFilteredMax: number;
  minBlockingSetOrgsFilteredSum: number;
  minSplittingSetMin: number;
  minSplittingSetMax: number;
  minSplittingSetSum: number;
  minSplittingSetOrgsMin: number;
  minSplittingSetOrgsMax: number;
  minSplittingSetOrgsSum: number;
  minBlockingSetCountryMin: number;
  minBlockingSetCountryMax: number;
  minBlockingSetCountrySum: number;
  minBlockingSetCountryFilteredMin: number;
  minBlockingSetCountryFilteredMax: number;
  minBlockingSetCountryFilteredSum: number;
  minBlockingSetISPMin: number;
  minBlockingSetISPMax: number;
  minBlockingSetISPSum: number;
  minBlockingSetISPFilteredMin: number;
  minBlockingSetISPFilteredMax: number;
  minBlockingSetISPFilteredSum: number;
  minSplittingSetCountryMin: number;
  minSplittingSetCountryMax: number;
  minSplittingSetCountrySum: number;
  minSplittingSetISPMin: number;
  minSplittingSetISPMax: number;
  minSplittingSetISPSum: number;
  crawlCount: number;
};

type NormalizedStatistics = Record<
  NetworkNodesType,
  NetworkNodeItemData["historyStats"]
>;

export const getNetworkNodesHistoryData = (
  graphStatistics: StatisticsResponseItem[],
) => {
  return graphStatistics.reduce(
    (acc: NormalizedStatistics, item) => {
      const name = item.time.toString();
      acc[NetworkNodesType.WATCHER_NODES].push({
        name,
        value: item.nrOfActiveWatchersSum,
      });
      acc[NetworkNodesType.VALIDATOR_NODES].push({
        name,
        value: item.nrOfActiveValidatorsSum,
      });
      acc[NetworkNodesType.FULL_VALIDATORS].push({
        name,
        value: item.nrOfActiveFullValidatorsSum,
      });
      acc[NetworkNodesType.ORGANIZATIONS].push({
        name,
        value: item.nrOfActiveOrganizationsSum,
      });
      acc[NetworkNodesType.TOP_TIER_VALIDATORS].push({
        name,
        value: item.topTierSum,
      });
      acc[NetworkNodesType.TOP_TIER_ORGANIZATIONS].push({
        name,
        value: item.topTierOrgsSum,
      });

      return acc;
    },
    {
      [NetworkNodesType.WATCHER_NODES]: [],
      [NetworkNodesType.VALIDATOR_NODES]: [],
      [NetworkNodesType.FULL_VALIDATORS]: [],
      [NetworkNodesType.ORGANIZATIONS]: [],
      [NetworkNodesType.TOP_TIER_VALIDATORS]: [],
      [NetworkNodesType.TOP_TIER_ORGANIZATIONS]: [],
    } as NormalizedStatistics,
  );
};
