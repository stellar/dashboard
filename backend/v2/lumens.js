import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";

let cachedData;

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

function updateApiLumens() {
  Promise.all([
    commonLumens.postBurnTotalCoins("https://horizon.stellar.org"),
    commonLumens.noncirculatingSupply(),
    commonLumens.circulatingSupply(),
  ])
    .then(function([totalSupply, noncirculatingSupply, circulatingSupply]) {
      var response = {
        updatedAt: new Date(),
        totalSupply,
        noncirculatingSupply,
        circulatingSupply,
        methodology: "https://www.stellar.org/foundation/mandate/",
      };

      cachedData = response;

      /* For CoinMarketCap */
      totalSupplyData = parseFloat(response.totalSupply);
      circulatingSupplyData = parseFloat(response.circulatingSupply);

      console.log("/api/lumens data saved!");
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500);
    });
}

setInterval(updateApiLumens, 10 * 60 * 1000);
updateApiLumens();
