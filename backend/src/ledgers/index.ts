import { Response, NextFunction } from "express";

import { redisClient, getOrThrow } from "../redisSetup";
import { REDIS_LEDGER_KEYS } from "./data";
import { formatOutput, getServerNamespace, LedgerStat } from "./utils";

export async function handler_month(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEYS.month);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(formatOutput(ledgers));
  } catch (e) {
    next(e);
  }
}

export async function handler_day(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEYS.day);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(formatOutput(ledgers));
  } catch (e) {
    next(e);
  }
}

export async function handler_hour(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEYS.hour);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(formatOutput(ledgers));
  } catch (e) {
    next(e);
  }
}

export async function handler_month_testnet(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const REDIS_LEDGER_KEY = getServerNamespace(REDIS_LEDGER_KEYS.month, true);
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEY);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(formatOutput(ledgers));
  } catch (e) {
    next(e);
  }
}

export async function handler_day_testnet(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const REDIS_LEDGER_KEY = getServerNamespace(REDIS_LEDGER_KEYS.day, true);
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEY);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(formatOutput(ledgers));
  } catch (e) {
    next(e);
  }
}

export async function handler_hour_testnet(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const REDIS_LEDGER_KEY = getServerNamespace(REDIS_LEDGER_KEYS.hour, true);
    const cachedData = await getOrThrow(redisClient, REDIS_LEDGER_KEY);
    const ledgers: LedgerStat[] = JSON.parse(cachedData);
    res.json(formatOutput(ledgers));
  } catch (e) {
    next(e);
  }
}
