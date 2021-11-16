import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";

let cachedData;
const LUMEN_SUPPLY_METRICS_URL =
  "https://www.stellar.org/developers/guides/lumen-supply-metrics.html";

let totalSupplyCheckResponse;

export const handler = function(req, res) {
  res.send(cachedData);
};

export const totalSupplyCheckHandler = function(req, res) {
  res.json(totalSupplyCheckResponse);
};

/* For CoinMarketCap */
export const totalSupplyHandler = function(req, res) {
  res.json(totalSupplyCheckResponse.totalSupplySum);
};
export const circulatingSupplyHandler = function(req, res) {
  res.json(totalSupplyCheckResponse.circulatingSupply);
};

function updateApiLumens() {
  Promise.all([
    commonLumens.ORIGINAL_SUPPLY_AMOUNT,
    commonLumens.inflationLumens(),
    commonLumens.burnedLumens(),
    commonLumens.feePool(),
    commonLumens.getUpgradeReserve(),
    commonLumens.sdfAccounts(),
  ])
    .then(function([
      originalSupply,
      inflationLumens,
      burnedLumens,
      feePool,
      upgradeReserve,
      sdfMandate,
    ]) {
      let totalSupply = new BigNumber(0)
        .plus(originalSupply)
        .plus(inflationLumens)
        .minus(burnedLumens);

      let circulatingSupply = totalSupply
        .minus(upgradeReserve)
        .minus(feePool)
        .minus(sdfMandate);

      let totalSupplySum = circulatingSupply
        .plus(upgradeReserve)
        .plus(feePool)
        .plus(sdfMandate);

      let response = {
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

      totalSupplyCheckResponse = {
        updatedAt: new Date(),
        totalSupply,
        inflationLumens,
        burnedLumens,
        totalSupplySum,
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
