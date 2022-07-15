import { Response, NextFunction } from "express";
import { getFeesData1d, getFeesData30d } from "./data";

export async function getFeeStats(_: any, res: Response, next: NextFunction) {
  try {
    return res.json({
      day: getFeesData1d(),
      month: getFeesData30d(),
    });
  } catch (e) {
    next(e);
  }
}
