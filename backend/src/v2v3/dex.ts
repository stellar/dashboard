import { Response, NextFunction } from "express";
import {
  getPaymentsData,
  getTradeData,
  getUniqueAssetsData,
  getVolumeData,
  getActiveAccountsData,
} from "./dexData";

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

export async function getVolume(_: any, res: Response, next: NextFunction) {
  try {
    return res.json(await getVolumeData());
  } catch (e) {
    next(e);
  }
}

export async function getAll(_: any, res: Response, next: NextFunction) {
  try {
    return res.json({
      volume: await getVolumeData(),
      tradesLast24h: await getTradeData(),
      paymentsLast24h: await getPaymentsData(),
      uniqueAssets: await getUniqueAssetsData(),
      activeAccounts: await getActiveAccountsData(),
    });
  } catch (e) {
    next(e);
  }
}
