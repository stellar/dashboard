import { bqClient } from "../bigQuery";
import { redisClient, getOrThrow } from "../redisSetup";
import { getErrorMessage, getPrice } from "./utils";

const bigQueryEndpointBase = "crypto-stellar.crypto_stellar_2";
const cache24hKey = "dex-volume-sum-24h";
const cache48hKey = "dex-volume-sum-48h";
const cacheOverallKey = "dex-volume-sum-overall";

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

async function fetchCachedData(key: string, query: string) {
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
  const payments = await fetchCachedData("payments24h", query);

  return payments[0]?.data;
}

export async function getTradeData() {
  const tradesBase = (filter = "") => `
    SELECT count(*) as data 
    FROM ${bigQueryEndpointBase}.history_trades
    WHERE (selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '')
    ${filter};
  `;
  const tradesQuery24h = tradesBase(`
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  `);
  const tradesQuery48h = tradesBase(`
    AND batch_run_date <= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY) 
  `);
  const tradesOverall = tradesBase();

  const results24h = await fetchCachedData("dex-trades24h", tradesQuery24h);
  const results48h = await fetchCachedData("dex-trades48h", tradesQuery48h);
  const resultsOverall = await fetchCachedData(
    "dex-trades-overall",
    tradesOverall,
  );

  const change =
    ((results24h[0]?.data - results48h[0]?.data) / results24h[0]?.data) * 100;

  return {
    trades_last_24h: results24h[0]?.data,
    change,
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

  const payments = await fetchCachedData("dex-uniqueAssets", query);

  return payments[0]?.data;
}

async function sumVolume(name: string, query: string) {
  const cachedOutput = await getOrThrow(redisClient, name, false);

  if (cachedOutput) {
    return JSON.parse(cachedOutput);
  }

  const rawData = await fetchBigQueryData(query);

  const output = await rawData.reduce(
    async (_prev: number, next: any): Promise<number> => {
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
    },
    0,
  );

  await redisClient.set(name, JSON.stringify(output));
  return output;
}

//TODO: Currently unused due to a pending update to how we fetch asset prices. Once they're available we should refactor and make use of the function below again.
export async function getVolumeData() {
  const baseQuery = (filter = "") => `
      WITH bought_trades AS
    (
        SELECT SUM(buying_amount) AS summed_amount, CONCAT(buying_asset_code, "-", buying_asset_issuer) AS asset_name,
        FROM ${bigQueryEndpointBase}.history_trades
        WHERE selling_liquidity_pool_id IS NULL
        ${filter}
        GROUP BY asset_name
            UNION ALL
        SELECT SUM(buying_amount) AS summed_amount, "native" as asset_name
        from ${bigQueryEndpointBase}.history_trades
        WHERE selling_liquidity_pool_id IS NULL
        AND buying_asset_TYPE = "native" 
        ${filter}
        GROUP BY buying_asset_type
    )
    SELECT * FROM bought_trades;
  `;
  const payments24h = baseQuery(`
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
  `);

  const payments48h = baseQuery(`
    AND batch_run_date <= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) 
    AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY) 
  `);

  const has24hCache = await getOrThrow(redisClient, cache24hKey, false);
  const has48hCache = await getOrThrow(redisClient, cache48hKey, false);

  if (!has48hCache && has24hCache) {
    await redisClient.set(cache48hKey, JSON.stringify(has24hCache));
    await redisClient.del(cache24hKey);
  }

  const sum24h = await sumVolume(cache24hKey, payments24h);
  const sum48h = await sumVolume(cache48hKey, payments48h);
  const sumOverall = await sumVolume(cacheOverallKey, baseQuery());

  const change = ((sum24h - sum48h) / sum24h) * 100;

  return {
    volume_last_24h: sum24h,
    change,
    overall: sumOverall,
  };
}

export async function getActiveAccountsData() {
  const query = `
    SELECT COUNT(DISTINCT(op_source_account)) as data
    FROM ${bigQueryEndpointBase}.enriched_history_operations 
    where type in (1, 2, 6, 13)
    AND closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR);
  `;

  const activeAccounts = await fetchCachedData("dex-activeAccounts", query);

  return activeAccounts[0]?.data;
}

export async function getFeesData30d() {
  const query = `
    SELECT 
      cast(l.closed_at as date) as closing_date, 
      (
        sum(t.fee_charged) / sum(t.operation_count)
      ) as fee_average
    FROM ${bigQueryEndpointBase}.history_transactions t
    JOIN ${bigQueryEndpointBase}.history_ledgers l
    ON t.ledger_sequence = l.sequence
    WHERE l.closed_at >= timestamp(date_add(current_date(), INTERVAL -30 DAY))
    GROUP BY closing_date
    ORDER BY closing_date
  `;

  const data = await fetchCachedData("fees-month", query);
  const output = data.map((fee) => {
    return {
      ...fee,
      closing_date: fee.closing_date.value,
    };
  });

  return output;
}

export async function getFeesData1d() {
  const query = `
    SELECT 
      l.closed_at - (EXTRACT(MINUTE FROM l.closed_at) * INTERVAL '01' MINUTE)
      - (EXTRACT(SECOND FROM l.closed_at) * INTERVAL '01' SECOND) as closing_hour,
      (sum(t.fee_charged) / sum(t.operation_count)) as fee_average
    FROM ${bigQueryEndpointBase}.history_transactions t
    JOIN ${bigQueryEndpointBase}.history_ledgers l
    ON t.ledger_sequence = l.sequence
    WHERE l.closed_at >= timestamp(date_add(current_date(), INTERVAL -1 DAY))
    GROUP BY closing_hour
    ORDER BY closing_hour
  `;
  const data = await fetchCachedData("fees-hour", query);

  const output = data.map((fee) => {
    return {
      ...fee,
      closing_hour: fee.closing_hour.value,
    };
  });
  return output;
}
