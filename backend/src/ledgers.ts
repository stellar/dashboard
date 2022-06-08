import stellarSdk from "stellar-sdk";
import { findIndex } from "lodash";
import { QueryRowsResponse } from "@google-cloud/bigquery";
import { Response, NextFunction } from "express";

import { redisClient, getOrThrow } from "./redisSetup";

import { getBqQueryByDate, bqClient, BQHistoryLedger } from "./bigQuery";

export enum INTERVALS {
  hour = "hour",
  day = "day",
  month = "month",
}

const LEDGER_ITEM_LIMIT = {
  hour: 60,
  day: 24,
  month: 30,
};

const REDIS_LEDGER_KEYS = {
  hour: "ledgers_hour",
  day: "ledgers_day",
  month: "ledgers",
};

const REDIS_PAGING_TOKEN_KEY = {
  hour: "paging_token_hour",
  day: "paging_token_day",
  month: "paging_token_month",
};

const HORIZON_LIMITS = {
  hour: 10,
  day: 100,
  month: 200,
};

const intervalTypes = [INTERVALS.day, INTERVALS.hour, INTERVALS.month];

const BIGQUERY_DATES = {
  hour: getBqDate(INTERVALS.hour),
  day: getBqDate(INTERVALS.day),
  month: getBqDate(INTERVALS.month),
};

function getBqDate(interval: INTERVALS) {
  const offsetByInterval = {
    hour: (now: Date = new Date()): Date =>
      new Date(now.setUTCHours(now.getUTCHours() - 1)),
    day: (now: Date = new Date()): Date =>
      new Date(now.setUTCDate(now.getUTCDate() - 1)),
    month: (now: Date = new Date()): Date =>
      new Date(now.setUTCMonth(now.getUTCMonth() - 1)),
  };
  const offset = offsetByInterval[interval]();
  return `${offset.getFullYear()}-${
    offset.getUTCMonth() + 1
  }-${offset.getUTCDate()} ${offset.getUTCHours()}:${offset.getUTCMinutes()}:${offset.getUTCSeconds()}`;
}

interface LedgerStat {
  date: string;
  transaction_count: number;
  operation_count: number;
  sequence: number;
}

// TODO - import Horizon type once https://github.com/stellar/js-stellar-sdk/issues/731 resolved
export type LedgerRecord = {
  closed_at: string;
  paging_token: string;
  sequence: number;
  successful_transaction_count: number;
  failed_transaction_count: number;
  operation_count: number;
};
const CURSOR_NOW = "now";

export async function handler_month(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEYS.month);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(ledgers);
  } catch (e) {
    next(e);
  }
}

export async function handler_day(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEYS.day);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(ledgers);
  } catch (e) {
    next(e);
  }
}

export async function handler_hour(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEYS.hour);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(ledgers);
  } catch (e) {
    next(e);
  }
}

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
  // using the starting point defined previously, call for horizon records
  // until the records end or we reach a record limit
  // set the pointer towards the latest ledger we got
  // update the cache with received ledgers
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
  // - check for amount of ledgers
  // - fetch cached ledgers from redis
  // - iterate each of the received ledgers (not the ones already cached)
  // - attempt to find a stored value for that day by it's key (the date formatted)
  // - If you do not find that day, push new data into the array
  // - If you do find a result, switch the new ledger in place of the old one. Sum the operation count for the day.
  // - set the pointer towards the latest stored ledger
  // - Sort the ledgers by most recent
  // - store the 30 most recent ledgers
  // - set the paging token redis variable
  // - log the ledge update
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

function dateSorter(a: LedgerStat, b: LedgerStat) {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);

  if (dateA.getMonth() === 11) {
    dateA.setFullYear(dateA.getFullYear() - 1);
  }
  if (dateB.getMonth() === 11) {
    dateB.setFullYear(dateB.getFullYear() - 1);
  }

  return dateB.getTime() - dateA.getTime();
}

const getLedgerKey = {
  hour: (closed_at: Date) =>
    `${closed_at.getUTCFullYear()}-${
      closed_at.getUTCMonth() + 1
    }-${closed_at.getUTCDate()} ${closed_at.getUTCHours()}:${closed_at.getUTCMinutes()}:00`,
  day: (closed_at: Date) =>
    `${closed_at.getUTCFullYear()}-${
      closed_at.getUTCMonth() + 1
    }-${closed_at.getUTCDate()} ${closed_at.getUTCHours()}:00:00`,
  month: (closed_at: Date) =>
    `${closed_at.getUTCFullYear()}-${
      closed_at.getUTCMonth() + 1
    }-${closed_at.getUTCDate()} 00:00:00`,
};
