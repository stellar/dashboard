import { bqClient } from "../../bigQuery";
import { redisClient, getOrThrow } from "../../redisSetup";
import { getErrorMessage, getPrice } from "./utils";

const bigQueryEndpointBase = "crypto-stellar.crypto_stellar_2";

async function fetchBigQueryData(query: string) {
  try {
    const [job] = await bqClient.createQueryJob(query);
    console.log("running bq query:", query);
    const [result] = await job.getQueryResults();
    return result;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("QUERY ERROR: ", message);
    return null;
  }
}

async function fetchMemoizedData(key: string, query: string) {
  try {
    const cachedData = await getOrThrow(redisClient, key);
    const output = JSON.parse(cachedData);
    return output;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message == "redis key not found") {
      const output = await fetchBigQueryData(query);
      await redisClient.set(key, JSON.stringify(output));
      return output;
    }
    console.error("ERROR: ", message);
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
  const tradesBase = (filter = "") => `
    SELECT count(*) as data 
    FROM ${bigQueryEndpointBase}.history_trades
    ${filter};
  `;
  const tradesQuery24h = tradesBase(`
    WHERE ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR) 
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY)
  `);
  const tradesQuery48h = tradesBase(`
    WHERE ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR) 
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
  `);
  const tradesOverall = tradesBase();

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
    with all_assets as (
      select asset_code, asset_issuer, asset_type
      from ${bigQueryEndpointBase}.history_assets
      group by asset_code, asset_issuer, asset_type
    )
    select count(distinct concat(aa.asset_code, ":", aa.asset_issuer)) as data
    from all_assets aa
    left outer join ${bigQueryEndpointBase}.trust_lines tl
      on tl.asset_code = aa.asset_code
      and tl.asset_issuer = aa.asset_issuer
    where tl.asset_code is not null;
  `;

  const payments = await fetchMemoizedData("dex-uniqueAssets", query);

  return payments[0]?.data;
}

async function sumVolume(name: string, query: string) {
  const rawData = await fetchMemoizedData(name, query);

  if (!rawData) return null;

  //TODO: This should be removed once queries run at a reasonable time.
  const output = rawData
    .slice(0, 100)
    .reduce(async (_prev: number, next: any): Promise<number> => {
      const asset = next["asset_name"];
      const prev = await _prev;
      if (!asset) return prev + 0;

      return getPrice(asset)
        .then((price) => {
          if (!price || price <= 0) {
            return prev + 0;
          }

          const nextSum = next["summed_amount"] * price;
          return prev + nextSum;
        })
        .catch((_) => {
          console.error(`WARNING: Failed to fetch price for asset: "${asset}"`);
          return prev + 0;
        });
    }, 0);
  return output;
}

export async function getVolumeData() {
  const baseQuery = (filter = "") => `
      WITH bought_trades AS
    (
        SELECT SUM(buying_amount) AS summed_amount, CONCAT(buying_asset_code, "-", buying_asset_issuer) AS asset_name,
        FROM ${bigQueryEndpointBase}.history_trades
        WHERE selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '' 
        ${filter}
        GROUP BY asset_name
            UNION ALL
        SELECT SUM(buying_amount) AS summed_amount, "native" as asset_name
        from ${bigQueryEndpointBase}.history_trades
        WHERE selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '' 
        AND buying_asset_TYPE = "native" 
        ${filter}
        GROUP BY buying_asset_type
    )
    SELECT * FROM bought_trades;
  `;
  const payments24h = baseQuery(`
    AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR)
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY) 
  `);

  const payments48h = baseQuery(`
    AND ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR)
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY) 
  `);

  const sum24h = await sumVolume("dex-volume-sum-24h", payments24h);
  const sum48h = await sumVolume("dex-volume-sum-48h", payments48h);
  const sumOverall = await sumVolume("dex-volume-sum-overall", baseQuery());

  return {
    volume_last_24h: sum24h,
    change: ((sum24h - sum48h) / sum24h) * 100,
    overall: sumOverall,
  };
}

export async function getActiveAccountsData() {
  const query = `
    SELECT COUNT(DISTINCT(op_source_account))
    FROM ${bigQueryEndpointBase}.enriched_history_operations 
    where type in (1, 2, 6, 13)
    AND closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR);
  `;

  const activeAccounts = await fetchMemoizedData("dex-activeAccounts", query);
  return activeAccounts[0]?.data;
}
