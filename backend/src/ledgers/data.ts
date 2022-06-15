import { QueryRowsResponse } from "@google-cloud/bigquery";
import stellarSdk from "stellar-sdk";

import { redisClient } from "../redisSetup";
import { bqClient, BQHistoryLedger, getBqQueryByDate } from "../bigQuery";
import {
  BIGQUERY_DATES,
  dateSorter,
  getLedgerKey,
  INTERVALS,
  LedgerStat,
} from "./utils";
import { findIndex } from "lodash";

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
};

// TODO - import Horizon type once https://github.com/stellar/js-stellar-sdk/issues/731 resolved
export type LedgerRecord = {
  closed_at: string;
  paging_token: string;
  sequence: number;
  successful_transaction_count: number;
  failed_transaction_count: number;
  operation_count: number;
};

export async function updateLedgers() {
  for (const interval of intervalTypes) {
    const cachedData =
      (await redisClient.get(REDIS_LEDGER_KEYS[interval])) || "[]";
    const cachedLedgers: LedgerStat[] = JSON.parse(cachedData);
    let pagingToken = "";

    if (cachedLedgers.length < LEDGER_ITEM_LIMIT[interval]) {
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
      await redisClient.del(REDIS_LEDGER_KEYS[interval]);
    } else {
      pagingToken =
        (await redisClient.get(REDIS_PAGING_TOKEN_KEY[interval])) || CURSOR_NOW;
    }

    await catchup(
      REDIS_LEDGER_KEYS[interval],
      pagingToken,
      REDIS_PAGING_TOKEN_KEY[interval],
      0,
      interval,
    );
  }

  const horizon = new stellarSdk.Server("https://horizon.stellar.org");
  horizon
    .ledgers()
    .cursor(CURSOR_NOW)
    .limit(200)
    .stream({
      onmessage: async (ledger: LedgerRecord) => {
        for (const interval of intervalTypes) {
          await updateCache(
            [ledger],
            REDIS_LEDGER_KEYS[interval],
            REDIS_PAGING_TOKEN_KEY[interval],
            interval,
          );
        }
      },
    });
}

export async function catchup(
  ledgersKey: string,
  pagingToken: string,
  pagingTokenKey: string,
  limit: number,
  interval,
  total: number = 0,
) {
  const horizon = new stellarSdk.Server("https://horizon.stellar.org");
  const resp = await horizon
    .ledgers()
    .cursor(pagingToken)
    .limit(HORIZON_LIMITS[interval])
    .call();
  let ledgers: LedgerRecord[] = [];

  ledgers = resp.records;
  total += resp.records.length;

  if (ledgers.length === 0 || (limit && total > limit)) {
    return;
  }
  pagingToken = ledgers[ledgers.length - 1].paging_token;
  await updateCache(ledgers, ledgersKey, pagingTokenKey, interval);

  await catchup(
    ledgersKey,
    pagingToken,
    pagingTokenKey,
    limit,
    interval,
    total,
  );
}

export async function updateCache(
  ledgers: LedgerRecord[],
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

  ledgers.forEach((ledger: LedgerRecord) => {
    const date: string = getLedgerKey[interval](new Date(ledger.closed_at));
    const index: number = findIndex(cachedStats, { date });
    if (index === -1) {
      cachedStats.push({
        date,
        sequence: ledger.sequence,
        transaction_count:
          ledger.successful_transaction_count + ledger.failed_transaction_count,
        operation_count: ledger.operation_count,
      });
    } else {
      cachedStats.splice(index, 1, {
        date,
        sequence: ledger.sequence,
        transaction_count:
          cachedStats[index].transaction_count +
          ledger.successful_transaction_count +
          ledger.failed_transaction_count,
        operation_count:
          cachedStats[index].operation_count + ledger.operation_count,
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

  console.log("ledgers updated to:", ledgers[ledgers.length - 1].closed_at);
}
