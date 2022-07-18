import { Response, NextFunction } from "express";
import { getFeesData1d, getFeesData30d } from "./data";

export async function getFeeStats(_: any, res: Response, next: NextFunction) {
  try {
    return res.json({
      day: await getFeesData1d(),
      month: await getFeesData30d(),
    });
  } catch (e) {
    next(e);
  }
}
