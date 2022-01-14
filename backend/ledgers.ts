import stellarSdk from "stellar-sdk";
import { findIndex } from "lodash";
import { Response, NextFunction } from "express";

import { redisClient, getOrThrow } from "./redis";

interface LedgerStat {
  date: string;
  transaction_count: number;
  operation_count: number;
}

// TODO - use any until https://github.com/stellar/js-stellar-sdk/issues/731 resolved
export type LedgerRecord = any;

const REDIS_LEDGER_KEY = "ledgers";
const REDIS_PAGING_TOKEN_KEY = "paging_token";
const CURSOR_NOW = "now";

export const handler = async function (
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEY);
    const ledgers: Array<LedgerStat> = JSON.parse(cachedData as string);
    res.json(ledgers);
  } catch (e) {
    next(e);
  }
};

export async function updateLedgers() {
  let pagingToken = await redisClient.get(REDIS_PAGING_TOKEN_KEY);
  if (pagingToken == null || pagingToken == "") {
    pagingToken = CURSOR_NOW;
  }

  await catchup(REDIS_LEDGER_KEY, pagingToken, REDIS_PAGING_TOKEN_KEY, 0);

  var horizon = new stellarSdk.Server("https://horizon.stellar.org");
  horizon
    .ledgers()
    .cursor(CURSOR_NOW)
    .limit(200)
    .stream({
      onmessage: async (ledger: LedgerRecord) => {
        await updateCache([ledger], REDIS_LEDGER_KEY, REDIS_PAGING_TOKEN_KEY);
      },
    });
}

export async function catchup(
  ledgersKey: string,
  pagingToken: string,
  pagingTokenKey: string,
  limit: number, // if 0, catchup until now
) {
  const horizon = new stellarSdk.Server("https://horizon.stellar.org");
  let ledgers = [];
  let total = 0;

  while (true) {
    const resp = await horizon.ledgers().cursor(pagingToken).limit(200).call();
    ledgers = resp.records;
    total += resp.records.length;
    if (ledgers.length == 0 || (limit && total > limit)) {
      break;
    }

    pagingToken = ledgers[ledgers.length - 1].paging_token;
    await updateCache(ledgers, ledgersKey, pagingTokenKey);
  }
}

export async function updateCache(
  ledgers: Array<LedgerRecord>,
  ledgersKey: string,
  pagingTokenKey: string,
) {
  if (!ledgers.length) {
    console.log("no ledgers to update");
    return;
  }
  const json = (await redisClient.get(ledgersKey)) || "[]";
  const cachedStats: Array<LedgerStat> = JSON.parse(json);
  let pagingToken = "";

  ledgers.forEach((ledger: LedgerRecord) => {
    const date = formatDate(ledger.closed_at);
    const index = findIndex(cachedStats, { date });
    if (index == -1) {
      cachedStats.push({
        date: date,
        transaction_count:
          ledger.successful_transaction_count + ledger.failed_transaction_count,
        operation_count: ledger.operation_count,
      });
    } else {
      cachedStats.splice(index, 1, {
        date: date,
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

  // only store latest 30 days
  await redisClient.set(ledgersKey, JSON.stringify(cachedStats.slice(0, 30)));
  await redisClient.set(pagingTokenKey, pagingToken);

  console.log("ledgers updated to:", ledgers[ledgers.length - 1].closed_at);
}

function dateSorter(a: LedgerStat, b: LedgerStat) {
  let dateA = new Date(a.date);
  let dateB = new Date(b.date);

  if (dateA.getMonth() == 11) {
    dateA.setFullYear(dateA.getFullYear() - 1);
  }
  if (dateB.getMonth() == 11) {
    dateB.setFullYear(dateB.getFullYear() - 1);
  }

  return dateB.getTime() - dateA.getTime();
}

// MM-DD
function formatDate(s: string) {
  const d = new Date(s);
  return `${("0" + (d.getUTCMonth() + 1)).slice(-2)}-${(
    "0" + d.getUTCDate()
  ).slice(-2)}`;
}
