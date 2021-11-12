import * as commonLumens from "../../common/lumens.js";
import BigNumber from "bignumber.js";

let totalSupplyData;
let totalSupplySumData;

export const totalSupplyDataHandler = function(req, res) {
  res.json(totalSupplyData);
};

export const totalSupplySumHandler = function(req, res) {
  res.json(totalSupplySumData);
};

function updateApiLumens() {
  Promise.all([commonLumens.totalSupply(), commonLumens.totalSupplySum()])
    .then(function([totalSupply, totalSupplySum]) {
      totalSupplyData = totalSupply.toString();
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
