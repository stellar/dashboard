import stellarSdk from "stellar-sdk";
import { pick, findIndex } from "lodash";
import { Response, NextFunction } from "express";

import { redisClient, getOrThrow } from "./redis";

interface Ledger {
  date: string;
  transaction_count: number;
  operation_count: number;
}

const REDIS_LEDGER_KEY = "ledgers";
const REDIS_PAGING_TOKEN_KEY = "paging_token";

export const handler = async function (
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(redisClient, "ledgers");
    const ledgers: Array<Ledger> = JSON.parse(cachedData as string);
    res.json(ledgers);
  } catch (e) {
    return next(e);
  }
};

async function updateLedgers() {
  let pagingToken = await redisClient.get("paging_token");
  if (pagingToken == null) {
    pagingToken = "now";
  }

  await catchupLedgers(pagingToken);

  var horizon = new stellarSdk.Server("https://horizon.stellar.org");
  horizon
    .ledgers()
    .cursor("now")
    .limit(200)
    .stream({
      // ALEC TODO - any
      onmessage: async (ledger: any) => {
        await updateCache(
          [ledger],
          REDIS_LEDGER_KEY,
          ledger.paging_token,
          REDIS_PAGING_TOKEN_KEY,
        );
      },
    });
}

// ALEC TODO - how long does this take to catchup?
export async function catchupLedgers(pagingToken: string) {
  const horizon = new stellarSdk.Server("https://horizon.stellar.org");
  let ledgers = [];
  while (true) {
    // ALEC TODO - check edge cases when length is 0 (eg. is pagingToken correct?)
    let resp = await horizon.ledgers().cursor(pagingToken).limit(200).call();
    ledgers = resp.records;
    if (ledgers.length == 0) {
      break;
    }

    pagingToken = ledgers[ledgers.length - 1].paging_token;
    await updateCache(
      ledgers,
      REDIS_LEDGER_KEY,
      pagingToken,
      REDIS_PAGING_TOKEN_KEY,
    );
  }
}

export async function updateCache(
  ledgers: Array<any>,
  ledgersKey: string,
  pagingToken: string,
  pagingTokenKey: string,
) {
  // organize ledgers by date
  // ALEC TODO - any
  let organizedLedgers: any = {};

  ledgers.forEach((ledger: any) => {
    // TODO - use type any until https://github.com/stellar/js-stellar-sdk/issues/731 resolved
    let newLedger: any = pick(ledger, [
      "sequence",
      "closed_at",
      "paging_token",
      "operation_count",
    ]);
    newLedger["transaction_count"] =
      ledger.successful_transaction_count + ledger.failed_transaction_count;

    let date = newLedger.closed_at.substring(5, 10);
    if (!(date in organizedLedgers)) {
      organizedLedgers[date] = { transaction_count: 0, operation_count: 0 };
    }

    organizedLedgers[date].transaction_count += newLedger.transaction_count;
    organizedLedgers[date].operation_count += newLedger.operation_count;

    // ALEC TODO - this gets the last one right?
    pagingToken = newLedger.paging_token;
  });

  // ALEC TODO - works?
  const json = (await redisClient.get(ledgersKey)) || "[]";
  let cachedLedgers = JSON.parse(json);

  // update cache with new data
  for (const date in organizedLedgers) {
    let index = findIndex(cachedLedgers, { date: date });
    if (index == -1) {
      cachedLedgers.push({
        date: date,
        transaction_count: organizedLedgers[date].transaction_count,
        operation_count: organizedLedgers[date].operation_count,
      });
    } else {
      cachedLedgers.splice(index, 1, {
        date: date,
        transaction_count:
          cachedLedgers[index].transaction_count +
          organizedLedgers[date].transaction_count,
        operation_count:
          cachedLedgers[index].operation_count +
          organizedLedgers[date].operation_count,
      });
    }
  }
  // ALEC TODO - sort cachedLedgers by date

  // ALEC TODO - why doesn't mset work?
  await redisClient.set(ledgersKey, JSON.stringify(cachedLedgers));
  await redisClient.set(pagingTokenKey, pagingToken);

  // ALEC TODO - use date?
  console.log("updated to cursor:", pagingToken);

  // ALEC TODO - check if greater than 30 days
}

updateLedgers();
