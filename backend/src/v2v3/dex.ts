import { bqClient } from "../bigQuery";
import { Response, NextFunction } from "express";
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

export async function get24hPaymentsData(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = `SELECT count(amount) as data FROM \`${bigQueryEndpointBase}.enriched_history_operations\` where type in (1, 2, 13) and closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR) and successful is true`;
    const payments = await fetchMemoizedData("payments24h", query);

    return res.json(payments[0]);
  } catch (e) {
    next(e);
  }
}

export async function getDexTrades24hData(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const tradesQuery24h = `SELECT count(history_operation_id) as data FROM ${bigQueryEndpointBase}.history_trades WHERE ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -24 HOUR) AND (selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '') AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY)`;
    const tradesQuery48h = `SELECT count(history_operation_id) as data FROM ${bigQueryEndpointBase}.history_trades WHERE ledger_closed_at >= TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL -48 HOUR) AND (selling_liquidity_pool_id IS NULL OR selling_liquidity_pool_id = '') AND batch_run_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)`;

    const results24h = await fetchMemoizedData("trades24h", tradesQuery24h);
    const results48h = await fetchMemoizedData("trades48h", tradesQuery48h);

    const difference = results24h[0]?.data - results48h[0]?.data;
    const output = (difference / results24h[0]?.data) * 100;

    return res.json({
      trades_last_24h: results24h[0]?.data,
      change: output.toFixed(2),
    });
  } catch (e) {
    next(e);
  }
}
