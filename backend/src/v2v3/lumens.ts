import BigNumber from "bignumber.js";
import { Response, NextFunction } from "express";
import { redisClient, getOrThrow } from "../redis/redisSetup";
import * as commonLumens from "../../../common/lumens.js";

const LUMEN_SUPPLY_METRICS_URL =
  "https://www.stellar.org/developers/guides/lumen-supply-metrics.html";

// v2:
interface LumensDataV2 {
  updatedAt: Date;
  originalSupply: string;
  inflationLumens: string;
  burnedLumens: string;
  totalSupply: string;
  upgradeReserve: string;
  feePool: string;
  sdfMandate: string;
  circulatingSupply: string;
  _details: string;
}

export async function v2Handler(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, "lumensV2");
    const obj: LumensDataV2 = JSON.parse(cachedData);
    res.json(obj);
  } catch (e) {
    next(e);
  }
}
export async function v2TotalSupplyHandler(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(redisClient, "lumensV2");
    const obj: LumensDataV2 = JSON.parse(cachedData);
    // for CoinMarketCap returning Number
    res.json(Number(obj.totalSupply));
  } catch (e) {
    next(e);
  }
}
export async function v2CirculatingSupplyHandler(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(redisClient, "lumensV2");
    const obj: LumensDataV2 = JSON.parse(cachedData);
    // for CoinMarketCap returning Number
    res.json(Number(obj.circulatingSupply));
  } catch (e) {
    next(e);
  }
}

// v3:
interface LumensDataV3 {
  updatedAt: Date;
  originalSupply: string;
  inflationLumens: string;
  burnedLumens: string;
  totalSupply: BigNumber;
  upgradeReserve: string;
  feePool: string;
  sdfMandate: string;
  circulatingSupply: BigNumber;
  _details: string;
}

interface TotalSupplyCheckResponse {
  updatedAt: Date;
  totalSupply: BigNumber;
  inflationLumens: string;
  burnedLumens: string;
  totalSupplySum: BigNumber;
  upgradeReserve: string;
  feePool: string;
  sdfMandate: string;
  circulatingSupply: BigNumber;
}

export async function v3Handler(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, "lumensV2");
    const obj: LumensDataV3 = JSON.parse(cachedData);
    res.json(obj);
  } catch (e) {
    next(e);
  }
}
export async function totalSupplyCheckHandler(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(
      redisClient,
      "totalSupplyCheckResponse",
    );
    const obj: TotalSupplyCheckResponse = JSON.parse(cachedData);
    res.json(obj);
  } catch (e) {
    next(e);
  }
}

/* For CoinMarketCap */
export async function v3TotalSupplyHandler(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(
      redisClient,
      "totalSupplyCheckResponse",
    );
    const obj: TotalSupplyCheckResponse = JSON.parse(cachedData);
    res.json(obj.totalSupplySum);
  } catch (e) {
    next(e);
  }
}
export async function v3CirculatingSupplyHandler(
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(
      redisClient,
      "totalSupplyCheckResponse",
    );
    const obj: TotalSupplyCheckResponse = JSON.parse(cachedData);
    res.json(obj.circulatingSupply);
  } catch (e) {
    next(e);
  }
}

export function updateApiLumens() {
  return Promise.all([
    commonLumens.ORIGINAL_SUPPLY_AMOUNT,
    commonLumens.inflationLumens(),
    commonLumens.burnedLumens(),
    commonLumens.totalSupply(),
    commonLumens.getUpgradeReserve(),
    commonLumens.feePool(),
    commonLumens.sdfAccounts(),
    commonLumens.circulatingSupply(),
  ])
    .then(
      async ([
        originalSupply,
        inflationLumens,
        burnedLumens,
        totalSupply,
        upgradeReserve,
        feePool,
        sdfMandate,
        circulatingSupply,
      ]) => {
        const lumensDataV2 = {
          updatedAt: new Date(),
          originalSupply,
          inflationLumens,
          burnedLumens,
          totalSupply,
          upgradeReserve,
          feePool,
          sdfMandate,
          circulatingSupply,
          _details: LUMEN_SUPPLY_METRICS_URL,
        };
        await redisClient.set("lumensV2", JSON.stringify(lumensDataV2));

        console.log("/api/v2/lumens data saved!");

        const totalSupplyCalculate: BigNumber = new BigNumber(originalSupply)
          .plus(inflationLumens)
          .minus(burnedLumens);

        const circulatingSupplyCalculate = totalSupplyCalculate
          .minus(upgradeReserve)
          .minus(feePool)
          .minus(sdfMandate);

        const totalSupplySum = circulatingSupplyCalculate
          .plus(upgradeReserve)
          .plus(feePool)
          .plus(sdfMandate);

        const lumensDataV3 = {
          updatedAt: new Date(),
          originalSupply,
          inflationLumens,
          burnedLumens,
          totalSupply: totalSupplyCalculate,
          upgradeReserve,
          feePool,
          sdfMandate,
          circulatingSupply: circulatingSupplyCalculate,
          _details: LUMEN_SUPPLY_METRICS_URL,
        };
        const totalSupplyCheckResponse = {
          updatedAt: new Date(),
          totalSupply: totalSupplyCalculate,
          inflationLumens,
          burnedLumens,
          totalSupplySum,
          upgradeReserve,
          feePool,
          sdfMandate,
          circulatingSupply: circulatingSupplyCalculate,
        };
        await redisClient.set("lumensV3", JSON.stringify(lumensDataV3));
        await redisClient.set(
          "totalSupplyCheckResponse",
          JSON.stringify(totalSupplyCheckResponse),
        );

        console.log("/api/v3/lumens data saved!");
      },
    )
    .catch((err) => {
      console.error(err);
      return err;
    });
}
