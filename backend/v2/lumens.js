import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";

let cachedData;
const LUMEN_SUPPLY_METRICS_URL =
  "https://www.stellar.org/developers/guides/lumen-supply-metrics.html";
/* For CoinMarketCap */
let totalSupplyData;
let circulatingSupplyData;

export const handler = function(req, res) {
  res.send(cachedData);
};

export const totalSupplyHandler = function(req, res) {
  res.json(totalSupplyData);
};

export const circulatingSupplyHandler = function(req, res) {
  res.json(circulatingSupplyData);
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
      var response = {
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

      cachedData = response;

      /* For CoinMarketCap */
      totalSupplyData = response.totalSupply * 1;
      circulatingSupplyData = response.circulatingSupply * 1;

      console.log("/api/v2/lumens data saved!");
    })
    .catch(function(err) {
      console.error(err);
      return err;
    });
}
