import { QueryRowsResponse } from "@google-cloud/bigquery";
import { Horizon } from "@stellar/stellar-sdk";

import { redisClient } from "../redis/redisSetup";
import { bqClient, BQHistoryLedger, getBqQueryByDate } from "../bigQuery";
import {
  BIGQUERY_DATES,
  getLedgerKey,
  INTERVALS,
  LedgerStat,
  dateSorter,
  getHorizonServer,
  getServerNamespace,
} from "./utils";
import { findIndex } from "lodash";
import { bigQueryEndpointBase, fetchCachedData } from "../utils";

const intervalTypes = [INTERVALS.hour, INTERVALS.day, INTERVALS.month];
const CURSOR_NOW = "now";

const LEDGER_ITEM_LIMIT = {
  hour: 60,
  day: 24,
  month: 30,
};

const HORIZON_LIMITS = {
  hour: 10,
  day: 100,
  month: 200,
};

const REDIS_PAGING_TOKEN_KEY = {
  hour: "paging_token_hour",
  day: "paging_token_day",
  month: "paging_token_month",
};

export const REDIS_LEDGER_KEYS = {
  hour: "ledgers_hour",
  day: "ledgers_day",
  month: "ledgers_month",
  operation_stats: "ledger-operation-stats",
};

interface sum {
  sum: number;
  size: number;
}

export interface LedgerAverages {
  closed_times: {
    lastTimestamp: number;
    sum: number;
    size: number;
  };
  transaction_failure_avg: sum;
  transaction_success_avg: sum;
  operation_avg: sum;
}

export async function updateLedgers(isTestnet: boolean) {
  const horizonServer = getHorizonServer(isTestnet);
  console.info("Updating ledgers using horizon server URL: ", horizonServer);

  for (const interval of intervalTypes) {
    const REDIS_LEDGER_KEY = getServerNamespace(
      REDIS_LEDGER_KEYS[interval],
      isTestnet,
    );

    const REDIS_PAGING_TOKEN_KEY_VALUE = getServerNamespace(
      REDIS_PAGING_TOKEN_KEY[interval],
      isTestnet,
    );

    const cachedData = (await redisClient.get(REDIS_LEDGER_KEY)) || "[]";
    const cachedLedgers: LedgerStat[] = JSON.parse(cachedData);
    let pagingToken = "";

    if (cachedLedgers.length < LEDGER_ITEM_LIMIT[interval] && !isTestnet) {
      try {
        const query = getBqQueryByDate(BIGQUERY_DATES[interval]);
        const [job] = await bqClient.createQueryJob(query);
        console.log("running bq query:", query);
        const [ledgers]: QueryRowsResponse = await job.getQueryResults();
        const ledger: BQHistoryLedger = ledgers[0];
        pagingToken = String(ledger.id);
      } catch (err) {
        console.error("BigQuery error", err);
        pagingToken = CURSOR_NOW;
      }
      await redisClient.del(REDIS_LEDGER_KEY);
    } else {
      pagingToken =
        (await redisClient.get(REDIS_PAGING_TOKEN_KEY_VALUE)) || CURSOR_NOW;
    }

    console.log(
      `${
        isTestnet ? "[TESTNET]" : "[MAINNET]"
      }: Starting ledgers catchup. This might take several minutes.`,
    );

    await catchup(
      REDIS_LEDGER_KEY,
      pagingToken,
      REDIS_PAGING_TOKEN_KEY_VALUE,
      0,
      interval,
      isTestnet,
    );
  }

  const horizon = new Horizon.Server(horizonServer);
  horizon
    .ledgers()
    .cursor(CURSOR_NOW)
    .limit(200)
    .stream({
      onmessage: async (ledger) => {
        for (const interval of intervalTypes) {
          const REDIS_LEDGER_KEY = getServerNamespace(
            REDIS_LEDGER_KEYS[interval],
            isTestnet,
          );

          const REDIS_PAGING_TOKEN_KEY_VALUE = getServerNamespace(
            REDIS_PAGING_TOKEN_KEY[interval],
            isTestnet,
          );
          await updateCache(
            // TODO: remove any when this is resolved https://github.com/stellar/js-stellar-sdk/issues/972
            [ledger as any as Horizon.ServerApi.LedgerRecord],
            REDIS_LEDGER_KEY,
            REDIS_PAGING_TOKEN_KEY_VALUE,
            interval,
          );
        }
        console.log(
          `${isTestnet ? "[TESTNET]" : "[MAINNET]"}: updated to ledger ${
            (ledger as any as Horizon.ServerApi.LedgerRecord).closed_at
          }`,
        );
      },
    });
}

export async function catchup(
  ledgersKey: string,
  pagingToken: string,
  pagingTokenKey: string,
  limit: number,
  interval: INTERVALS,
  isTestnet: boolean,
  total: number = 0,
) {
  const horizonServer = getHorizonServer(isTestnet);
  const horizon = new Horizon.Server(horizonServer);
  let ledgers: Horizon.ServerApi.LedgerRecord[] = [];

  const resp = await horizon
    .ledgers()
    .cursor(pagingToken)
    .limit(HORIZON_LIMITS[interval])
    .call();

  ledgers = resp.records;
  total += resp.records.length;

  if (ledgers.length === 0 || (limit && total > limit)) {
    return;
  }

  pagingToken = ledgers[ledgers.length - 1].paging_token;
  await updateCache(ledgers, ledgersKey, pagingTokenKey, interval);

  console.log(
    `${isTestnet ? "[TESTNET]" : "[MAINNET]"}: Caught up ledgers to:`,
    ledgers[ledgers.length - 1].closed_at,
  );

  await catchup(
    ledgersKey,
    pagingToken,
    pagingTokenKey,
    limit,
    interval,
    isTestnet,
    total,
  );
}

export async function updateCache(
  ledgers: Array<Horizon.ServerApi.LedgerRecord>,
  ledgersKey: string,
  pagingTokenKey: string,
  interval,
) {
  if (!ledgers.length) {
    console.log("no ledgers to update");
    return;
  }
  const json = (await redisClient.get(ledgersKey)) || "[]";
  const cachedStats: LedgerStat[] = JSON.parse(json);
  let pagingToken = "";

  ledgers.forEach((ledger: Horizon.ServerApi.LedgerRecord) => {
    const date: string = getLedgerKey[interval](new Date(ledger.closed_at));
    const index: number = findIndex(cachedStats, { date });
    if (index === -1) {
      cachedStats.push({
        date,
        data: {
          sequence: ledger.sequence,
          operation_count: ledger.operation_count,
          transaction_success: ledger.successful_transaction_count,
          transaction_failure: ledger.failed_transaction_count,
          start: ledger.closed_at,
          end: ledger.closed_at,
          total_ledgers: 1,
        },
      });
    } else {
      cachedStats.splice(index, 1, {
        date,
        data: {
          sequence: ledger.sequence,
          transaction_success:
            cachedStats[index].data.transaction_success +
            ledger.successful_transaction_count,
          transaction_failure:
            cachedStats[index].data.transaction_failure +
            ledger.failed_transaction_count,
          operation_count:
            cachedStats[index].data.operation_count + ledger.operation_count,
          total_ledgers: cachedStats[index].data.total_ledgers + 1,
          start: cachedStats[index].data.start,
          end: ledger.closed_at,
        },
      });
    }
    pagingToken = ledger.paging_token;
  });

  cachedStats.sort(dateSorter);
  await redisClient.set(
    ledgersKey,
    JSON.stringify(cachedStats.slice(0, LEDGER_ITEM_LIMIT[interval])),
  );
  await redisClient.set(pagingTokenKey, pagingToken);
}

export async function getOpStats() {
  const query = `
    SELECT 
      FORMAT_DATE('%Y-%m', cast(closed_at as date)) as closing_date,
      SUM(tx_set_operation_count) as operations 
    FROM ${bigQueryEndpointBase}.history_ledgers 
    GROUP BY closing_date 
    ORDER BY closing_date
  `;

  const output = await fetchCachedData(
    REDIS_LEDGER_KEYS.operation_stats,
    query,
  );

  return output;
}
