import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";
import { Response } from "express";
import { redisClient } from "../app";

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

export const v2Handler = async function(_: any, res: Response) {
  try {
    let cachedData = await redisClient.get("lumensV2");
    // ALEC TODO - what happens if parsing ""?
    let obj: LumensDataV2 = JSON.parse(cachedData || "");
    res.json(obj);
  } catch (e) {
    console.error(e);
    // ALEC TODO - should handle differently?
    res.json("");
  }
};
export const v2TotalSupplyHandler = async function(_: any, res: Response) {
  try {
    let cachedData = await redisClient.get("lumensV2");
    // ALEC TODO - what happens if parsing ""?
    let obj: LumensDataV2 = JSON.parse(cachedData || "");
    res.json(parseFloat(obj.totalSupply));
  } catch (e) {
    console.error(e);
    res.json("");
  }
};
export const v2CirculatingSupplyHandler = async function(
  _: any,
  res: Response,
) {
  try {
    let cachedData = await redisClient.get("lumensV2");
    // ALEC TODO - what happens if parsing ""?
    let obj: LumensDataV2 = JSON.parse(cachedData || "");
    // ALEC TODO - any chance this fails?
    res.json(parseFloat(obj.circulatingSupply));
  } catch (e) {
    console.error(e);
    res.json("");
  }
};

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

export const v3Handler = async function(_: any, res: Response) {
  try {
    let cachedData = await redisClient.get("lumensV2");
    // ALEC TODO - what happens if parsing ""?
    let obj: LumensDataV3 = JSON.parse(cachedData || "");
    res.json(obj);
  } catch (e) {
    console.error(e);
    // ALEC TODO - should handle differently?
    res.json("");
  }
};
export const totalSupplyCheckHandler = async function(_: any, res: Response) {
  try {
    let cachedData = await redisClient.get("totalSupplyCheckResponse");
    // ALEC TODO - what happens if parsing ""?
    let obj: TotalSupplyCheckResponse = JSON.parse(cachedData || "");
    res.json(obj);
  } catch (e) {
    console.error(e);
    // ALEC TODO - should handle differently?
    res.json("");
  }
};

/* For CoinMarketCap */
export const v3TotalSupplyHandler = async function(_: any, res: Response) {
  try {
    let cachedData = await redisClient.get("totalSupplyCheckResponse");
    // ALEC TODO - what happens if parsing ""?
    let obj: TotalSupplyCheckResponse = JSON.parse(cachedData || "");
    res.json(obj.totalSupplySum);
  } catch (e) {
    console.error(e);
    // ALEC TODO - should handle differently?
    res.json("");
  }
};
export const v3CirculatingSupplyHandler = async function(
  _: any,
  res: Response,
) {
  try {
    let cachedData = await redisClient.get("totalSupplyCheckResponse");
    // ALEC TODO - what happens if parsing ""?
    let obj: TotalSupplyCheckResponse = JSON.parse(cachedData || "");
    res.json(obj.circulatingSupply);
  } catch (e) {
    console.error(e);
    // ALEC TODO - should handle differently?
    res.json("");
  }
};

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
    .then(async function([
      originalSupply,
      inflationLumens,
      burnedLumens,
      totalSupply,
      upgradeReserve,
      feePool,
      sdfMandate,
      circulatingSupply,
    ]) {
      let lumensDataV2 = {
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

      // ALEC TODO - okay to remove?
      // /* For CoinMarketCap */
      // await redisClient.set("totalSupplyData", Number(totalSupply));
      // await redisClient.set("circulatingSupplyData", Number(circulatingSupply));

      console.log("/api/v2/lumens data saved!");

      let totalSupplyCalculate = new BigNumber(originalSupply)
        .plus(inflationLumens)
        .minus(burnedLumens);

      let circulatingSupplyCalculate = totalSupplyCalculate
        .minus(upgradeReserve)
        .minus(feePool)
        .minus(sdfMandate);

      let totalSupplySum = circulatingSupplyCalculate
        .plus(upgradeReserve)
        .plus(feePool)
        .plus(sdfMandate);

      let lumensDataV3 = {
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
      let totalSupplyCheckResponse = {
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
    })
    .catch(function(err) {
      console.error(err);
      return err;
    });
}
