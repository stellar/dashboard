import { Response, NextFunction } from "express";
import {
  getActiveAccountsData,
  getFeesData1d,
  getFeesData30d,
  getPaymentsData,
  getTradeData,
  getUniqueAssetsData,
} from "./data";

export async function get24hPaymentsData(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await getPaymentsData());
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
    return res.json(await getTradeData());
  } catch (e) {
    next(e);
  }
}

export async function getUniqueAssets(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await getUniqueAssetsData());
  } catch (e) {
    next(e);
  }
}

export async function getActiveAccounts(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    return res.json(await getActiveAccountsData());
  } catch (e) {
    next(e);
  }
}

export async function getAll(_: any, res: Response, next: NextFunction) {
  try {
    return res.json({
      tradesLast24H: await getTradeData(),
      paymentsLast24h: await getPaymentsData(),
      uniqueAssets: await getUniqueAssetsData(),
      activeAccounts: await getActiveAccountsData(),
      fees: {
        month: await getFeesData30d(),
        hour: await getFeesData1d(),
      },
    });
  } catch (e) {
    next(e);
  }
}
