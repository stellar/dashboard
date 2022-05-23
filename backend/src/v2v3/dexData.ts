import { bqClient } from "../bigQuery";
import { redisClient, getOrThrow } from "../redisSetup";

const bigQueryEndpointBase = "crypto-stellar.crypto_stellar_2";

async function fetchBigQueryData(query: string) {
  try {
    const [job] = await bqClient.createQueryJob(query);
    console.log("running bq query:", query);
    const [result] = await job.getQueryResults();
    return result;
  } catch (err) {
    console.error("BigQuery error", err);
    throw new Error(err);
  }
}

async function fetchMemoizedData(key, query) {
  try {
    const cachedData = await getOrThrow(redisClient, key);
    const output = JSON.parse(cachedData);
    return output;
  } catch (e) {
    if (e.message == "redis key not found") {
      const output = await fetchBigQueryData(query);
      await redisClient.set(key, JSON.stringify(output));
      return output;
    }
    throw new Error(e);
  }
}

export async function getPaymentsData() {
  const query = `
  SELECT count(*) as data 
  FROM ${bigQueryEndpointBase}.enriched_history_operations 
  WHERE type in (1, 2, 13) 
  AND closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR) 
  AND successful is true
`;
  const payments = await fetchMemoizedData("dex-payments24h", query);

  return payments[0]?.data;
}

export async function getTradeData() {
  const tradesQuery24h = `
    SELECT count(*) as data 
    FROM ${bigQueryEndpointBase}.history_trades 
    WHERE ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR) 
    AND (selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '') 
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY);
  `;
  const tradesQuery48h = `
    SELECT count(*) as data 
    FROM ${bigQueryEndpointBase}.history_trades 
    WHERE ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR) 
    AND (selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '') 
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY);
  `;
  const tradesOverall = `
    SELECT count(*) as data 
    FROM ${bigQueryEndpointBase}.history_trades 
    WHERE (selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '') 
  `;

  const results24h = await fetchMemoizedData("dex-trades24h", tradesQuery24h);
  const results48h = await fetchMemoizedData("dex-trades48h", tradesQuery48h);
  const resultsOverall = await fetchMemoizedData(
    "dex-trades-overall",
    tradesOverall,
  );

  const difference = results24h[0]?.data - results48h[0]?.data;
  const output = (difference / results24h[0]?.data) * 100;

  return {
    trades_last_24h: results24h[0]?.data,
    change: output.toFixed(2),
    overall: resultsOverall[0]?.data,
  };
}

export async function getUniqueAssetsData() {
  const query = `
  SELECT count(DISTINCT(id)) as data 
  FROM ${bigQueryEndpointBase}.history_assets 
  WHERE id is not null;
  `;
  const payments = await fetchMemoizedData("dex-uniqueAssets", query);

  return payments[0]?.data;
}

export async function getVolumeData() {
  const axios = require("axios").default;
  const query24h = `
    WITH bought_trades AS
    (
    SELECT SUM(buying_amount) AS summed_amount, CONCAT(buying_asset_code, ":", buying_asset_issuer) AS asset_name,
    FROM ${bigQueryEndpointBase}.history_trades
    WHERE selling_liquidity_pool_id IS NULL 
    OR selling_liquidity_pool_id = '' 
    AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR)
    GROUP BY asset_name
        UNION ALL
    SELECT SUM(buying_amount) AS summed_amount, "native" as asset_name
    FROM ${bigQueryEndpointBase}.history_trades
    WHERE selling_liquidity_pool_id IS NULL 
    OR selling_liquidity_pool_id = '' 
    AND buying_asset_TYPE = "native" 
    AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR)
    GROUP BY buying_asset_type
    )
    SELECT sum(summed_amount) as data FROM bought_trades;
  `;

  const query48h = `
    WITH bought_trades AS
    (
    SELECT SUM(buying_amount) AS summed_amount, CONCAT(buying_asset_code, ":", buying_asset_issuer) AS asset_name,
    FROM ${bigQueryEndpointBase}.history_trades
    WHERE selling_liquidity_pool_id IS NULL 
    OR selling_liquidity_pool_id = '' 
    AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR)
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) 
    GROUP BY asset_name
        UNION ALL
    SELECT SUM(buying_amount) AS summed_amount, "native" as asset_name
    FROM ${bigQueryEndpointBase}.history_trades
    WHERE selling_liquidity_pool_id IS NULL 
    OR selling_liquidity_pool_id = '' 
    AND buying_asset_TYPE = "native" 
    AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR)
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) 
    GROUP BY buying_asset_type
    )
    SELECT sum(summed_amount) as data FROM bought_trades;
  `;

  const queryOverall = `
  WITH bought_trades AS
  (
  SELECT SUM(buying_amount) AS summed_amount, CONCAT(buying_asset_code, ":", buying_asset_issuer) AS asset_name,
  FROM ${bigQueryEndpointBase}.history_trades
  WHERE selling_liquidity_pool_id IS NULL 
  OR selling_liquidity_pool_id = '' 
  AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR)
  AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) 
  GROUP BY asset_name
      UNION ALL
  SELECT SUM(buying_amount) AS summed_amount, "native" as asset_name
  FROM ${bigQueryEndpointBase}.history_trades
  WHERE selling_liquidity_pool_id IS NULL 
  OR selling_liquidity_pool_id = '' 
  AND buying_asset_TYPE = "native" 
  AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR)
  AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) 
  GROUP BY buying_asset_type
  )
  SELECT sum(summed_amount) as data FROM bought_trades;
`;

  const summedAssets24h = await fetchMemoizedData("dex-assetSum24h", query24h);
  const summedAssets48h = await fetchMemoizedData("dex-assetSum48", query48h);
  const summedAssetsOverall = await fetchMemoizedData(
    "dex-assetSumOverall",
    queryOverall,
  );

  const difference = summedAssets24h[0]?.data - summedAssets48h[0]?.data;
  const output = (difference / summedAssets24h[0]?.data) * 100;

  const yXLMValue = await axios.get(
    "https://api.stellar.expert/explorer/public/xlm-price",
  );

  return {
    last24h: summedAssets24h[0]?.data * yXLMValue?.data[0][1],
    change: output.toFixed(2),
    overall: summedAssetsOverall[0]?.data,
  };
}

export async function getActiveAccountsData() {
  const query = `
    SELECT COUNT(*) as data
    FROM ${bigQueryEndpointBase}.accounts
    WHERE batch_insert_ts >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR);
  `;
  const activeAccounts = await fetchMemoizedData("dex-activeAccounts", query);
  console.log(activeAccounts);
  return activeAccounts[0]?.data;
}
