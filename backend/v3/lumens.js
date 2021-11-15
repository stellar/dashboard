import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";

let cachedData;
const LUMEN_SUPPLY_METRICS_URL =
  "https://www.stellar.org/developers/guides/lumen-supply-metrics.html";

/* For CoinMarketCap */
let totalSupplyData;
let circulatingSupplyData;

let totalSupplyCheckResponse;

export const handler = function(req, res) {
  res.send(cachedData);
};

export const totalSupplyHandler = function(req, res) {
  res.json(totalSupplyData);
};

export const circulatingSupplyHandler = function(req, res) {
  res.json(circulatingSupplyData);
};

export const totalSupplyCheckHandler = function(req, res) {
  res.json(totalSupplyCheckResponse);
};

function updateApiLumens() {
  Promise.all([
    commonLumens.ORIGINAL_SUPPLY_AMOUNT,
    commonLumens.inflationLumens(),
    commonLumens.burnedLumens(),
    commonLumens.totalSupply(),
    commonLumens.getUpgradeReserve(),
    commonLumens.feePool(),
    commonLumens.sdfAccounts(),
    commonLumens.circulatingSupply(),
    commonLumens.totalSupplySum(),
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
      totalSupplySum,
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

      circulatingSupplyData = circulatingSupply.toString();

      totalSupplyCheckResponse = {
        updatedAt: new Date(),
        totalSupply: totalSupply.toString(),
        inflationLumens,
        burnedLumens,
        totalSupplySum: totalSupplySum.toString(),
        upgradeReserve,
        feePool,
        sdfMandate,
        circulatingSupply,
      };

      console.log("/api/lumens data saved!");
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500);
    });
}

setInterval(updateApiLumens, 1 * 60 * 1000);
updateApiLumens();
