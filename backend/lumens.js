import * as commonLumens from "../common/lumens.js";

let cachedData;

export const handler = function(req, res) {
  res.send(cachedData);
}

function updateApiLumens() {
  Promise.all([
    commonLumens.totalCoins("https://horizon.stellar.org"),
    commonLumens.availableCoins(),
    commonLumens.distributionAll(),
    commonLumens.distributionDirectSignup(),
    commonLumens.distributionBitcoinProgram(),
    commonLumens.distributionPartnershipProgram(),
    commonLumens.distributionBuildChallenge(),
  ]).then(function(data) {
    var response = {
      updatedAt: new Date(),
      totalCoins: data[0],
      availableCoins: data[1],
      distributedCoins: data[2],
      programs: {
        directProgram: data[3],
        bitcoinProgram: data[4],
        partnershipProgram: data[5],
        buildChallenge: data[6]
      }
    };

    cachedData = response;
    console.log("/api/lumens data saved!");
  })
  .catch(function(err) {
    console.error(err);
    res.sendStatus(500);
  });
}

setInterval(updateApiLumens, 10*60*1000);
updateApiLumens();
