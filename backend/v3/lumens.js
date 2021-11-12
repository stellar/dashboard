import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";

let totalSupplyData;
let circulatingSupplyData;
let totalSupplySumData;

export const totalSupplyHandler = function(req, res) {
  res.json(totalSupplyData);
};

export const circulatingSupplyHandler = function(req, res) {
  res.json(circulatingSupplyData);
};

export const totalSupplySumHandler = function(req, res) {
  res.json(totalSupplySumData);
};

function updateApiLumens() {
  Promise.all([
    commonLumens.totalSupply(),
    commonLumens.totalSupplySum(),
    commonLumens.circulatingSupply(),
  ])
    .then(function([totalSupply, totalSupplySum, circulatingSupply]) {
      totalSupplyData = totalSupply.toString();
      circulatingSupplyData = circulatingSupply.toString();
      totalSupplySumData = totalSupplySum.toString();

      console.log("/api/lumens data saved!");
    })
    .catch(function(err) {
      console.error(err);
      res.sendStatus(500);
    });
}

setInterval(updateApiLumens, 10 * 60 * 1000);
updateApiLumens();
