import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";
import { Response } from "express";

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

export let lumensDataV2: LumensDataV2;

/* For CoinMarketCap */
let totalSupplyData: number;
let circulatingSupplyData: number;

export const v2Handler = function({}, res: Response) {
  res.send(lumensDataV2);
};
export const v2TotalSupplyHandler = function({}, res: Response) {
  res.json(totalSupplyData);
};
export const v2CirculatingSupplyHandler = function({}, res: Response) {
  res.json(circulatingSupplyData);
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
export let lumensDataV3: LumensDataV3;

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
export let totalSupplyCheckResponse: TotalSupplyCheckResponse;

export const v3Handler = function({}, res: Response) {
  res.send(lumensDataV3);
};
export const totalSupplyCheckHandler = function({}, res: Response) {
  res.json(totalSupplyCheckResponse);
};

/* For CoinMarketCap */
export const v3TotalSupplyHandler = function({}, res: Response) {
  res.json(totalSupplyCheckResponse.totalSupplySum);
};
export const v3CirculatingSupplyHandler = function({}, res: Response) {
  res.json(totalSupplyCheckResponse.circulatingSupply);
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
    .then(function([
      originalSupply,
      inflationLumens,
      burnedLumens,
      totalSupply,
      upgradeReserve,
      feePool,
      sdfMandate,
      circulatingSupply,
    ]) {
      lumensDataV2 = {
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

      /* For CoinMarketCap */
      totalSupplyData = totalSupply * 1;
      circulatingSupplyData = circulatingSupply * 1;

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

      lumensDataV3 = {
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
      totalSupplyCheckResponse = {
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

      console.log("/api/v3/lumens data saved!");
    })
    .catch(function(err) {
      console.error(err);
      return err;
    });
}
