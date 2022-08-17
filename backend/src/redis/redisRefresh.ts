import { redisClient } from "./redisSetup";
import {
  getPaymentsData,
  getTradeData,
  getUniqueAssetsData,
  getActiveAccountsData,
  REDIS_DEX_KEYS,
} from "../dex/data";
import { getFeesData30d, getFeesData1d, REDIS_FEES_KEYS } from "../fees/data";
import { getOpStats, REDIS_LEDGER_KEYS } from "../ledgers/data";

const DAY = "day";
const MONTH = "month";

(async () => {
  let resetKeys = [];
  if (process.argv[2] === DAY) {
    const resetKeys = [
      REDIS_FEES_KEYS.FEES_DAY,
      REDIS_FEES_KEYS.FEES_MONTH,
      REDIS_DEX_KEYS.PAYMENTS_24H,
      REDIS_DEX_KEYS.DEX_TRADES_24H,
      REDIS_DEX_KEYS.DEX_TRADES_48H,
      REDIS_DEX_KEYS.DEX_TRADES_OVERALL,
      REDIS_DEX_KEYS.DEX_UNIQUE_ASSETS,
      REDIS_DEX_KEYS.DEX_ACTIVE_ACCOUNTS,
    ];
  } else if (process.argv[2] === MONTH) {
    resetKeys = [REDIS_LEDGER_KEYS.operation_stats];
  }

  for (const k of resetKeys) {
    await redisClient.del(k);
    console.log("cleared redis key:", k);
  }

  // lets refresh the redis data by calling BQ from here
  if (process.argv[2] === DAY) {
    await getFeesData30d();
    await getFeesData1d();
    await getPaymentsData();
    await getTradeData();
    await getUniqueAssetsData();
    await getActiveAccountsData();
  } else if (process.argv[2] === MONTH) {
    await getOpStats();
  }

  await redisClient.quit();
})();
