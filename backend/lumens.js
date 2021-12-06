import * as commonLumens from "../common/lumens.js";
import BigNumber from "bignumber.js";

// v1:
export let v1Cache;

export const v1Handler = function(req, res) {
  res.send(v1Cache);
};

// v2:
export let v2Cache;
const LUMEN_SUPPLY_METRICS_URL =
  "https://www.stellar.org/developers/guides/lumen-supply-metrics.html";
/* For CoinMarketCap */
let totalSupplyData;
let circulatingSupplyData;

export const v2Handler = function(req, res) {
  res.send(v2Cache);
};

export const v2TotalSupplyHandler = function(req, res) {
  res.json(totalSupplyData);
};

export const v2CirculatingSupplyHandler = function(req, res) {
  res.json(circulatingSupplyData);
};

// v3:
export let v3Cache;

export let totalSupplyCheckResponse;

export const v3Handler = function(req, res) {
  res.send(v3Cache);
};

export const totalSupplyCheckHandler = function(req, res) {
  res.json(totalSupplyCheckResponse);
};

/* For CoinMarketCap */
export const v3TotalSupplyHandler = function(req, res) {
  res.json(totalSupplyCheckResponse.totalSupplySum);
};
export const v3CirculatingSupplyHandler = function(req, res) {
  res.json(totalSupplyCheckResponse.circulatingSupply);
};

export function updateApiLumens() {
  return Promise.all([
    // v1:
    commonLumens.totalSupply(),
    commonLumens.circulatingSupply(),
    commonLumens.directDevelopmentAll(),
    commonLumens.distributionEcosystemSupport(),
    commonLumens.distributionUseCaseInvestment(),
    commonLumens.distributionUserAcquisition(),

    // v2 and v3:
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
      // v1:
      totalCoins,
      availableCoins,
      directDevelopment,
      ecosystemSupport,
      useCaseInvestment,
      userAcquisition,

      // v2 and v3:
      originalSupply,
      inflationLumens,
      burnedLumens,
      totalSupply,
      upgradeReserve,
      feePool,
      sdfMandate,
      circulatingSupply,
    ]) {
      // v1:
      v1Cache = {
        updatedAt: new Date(),
        totalCoins,
        availableCoins,
        programs: {
          directDevelopment,
          ecosystemSupport,
          useCaseInvestment,
          userAcquisition,
        },
      };
      console.log("/api/lumens data saved!");

      // v2:
      v2Cache = {
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

      // v3:
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

      v3Cache = {
        updatedAt: new Date(),
        originalSupply,
        inflationLumens,
        burnedLumens,
        totalSupplyCalculate,
        upgradeReserve,
        feePool,
        sdfMandate,
        circulatingSupplyCalculate,
        _details: LUMEN_SUPPLY_METRICS_URL,
      };

      totalSupplyCheckResponse = {
        updatedAt: new Date(),
        totalSupplyCalculate,
        inflationLumens,
        burnedLumens,
        totalSupplySum,
        upgradeReserve,
        feePool,
        sdfMandate,
        circulatingSupplyCalculate,
      };

      console.log("/api/v3/lumens data saved!");
    })
    .catch(function(err) {
      console.error(err);
      return err;
    });
}
