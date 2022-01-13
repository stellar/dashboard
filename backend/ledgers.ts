import stellarSdk from "stellar-sdk";
import { findIndex } from "lodash";
import { Response, NextFunction } from "express";

import { redisClient, getOrThrow } from "./redis";

interface Ledger {
  date: string;
  transaction_count: number;
  operation_count: number;
}

// TODO - use any until https://github.com/stellar/js-stellar-sdk/issues/731 resolved
export type LedgerRecord = any;

const REDIS_LEDGER_KEY = "ledgers";
const REDIS_PAGING_TOKEN_KEY = "paging_token";

export const handler = async function (
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEY);
    const ledgers: Array<Ledger> = JSON.parse(cachedData as string);
    res.json(ledgers);
  } catch (e) {
    return next(e);
  }
};

export async function updateLedgers() {
  let pagingToken = await redisClient.get("paging_token");
  if (pagingToken == null || pagingToken == "") {
    pagingToken = "now";
  }

  await catchup(REDIS_LEDGER_KEY, pagingToken, REDIS_PAGING_TOKEN_KEY, 0);

  var horizon = new stellarSdk.Server("https://horizon.stellar.org");
  horizon
    .ledgers()
    .cursor("now")
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
    let resp = await horizon.ledgers().cursor(pagingToken).limit(200).call();
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
  let cachedLedgers: Array<Ledger> = JSON.parse(json);
  let pagingToken = "";

  ledgers.forEach((ledger: LedgerRecord) => {
    let date = formatDate(ledger.closed_at);
    let index = findIndex(cachedLedgers, { date: date });
    if (index == -1) {
      cachedLedgers.push({
        date: date,
        transaction_count:
          ledger.successful_transaction_count + ledger.failed_transaction_count,
        operation_count: ledger.operation_count,
      });
    } else {
      cachedLedgers.splice(index, 1, {
        date: date,
        transaction_count:
          cachedLedgers[index].transaction_count +
          ledger.successful_transaction_count +
          ledger.failed_transaction_count,
        operation_count:
          cachedLedgers[index].operation_count + ledger.operation_count,
      });
    }
    pagingToken = ledger.paging_token;
  });
  cachedLedgers.sort(dateSorter);

  // only store latest 30 days
  await redisClient.set(ledgersKey, JSON.stringify(cachedLedgers.slice(0, 30)));
  await redisClient.set(pagingTokenKey, pagingToken);

  console.log("ledgers updated to:", ledgers[ledgers.length - 1].closed_at);
}

function dateSorter(a: Ledger, b: Ledger) {
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
