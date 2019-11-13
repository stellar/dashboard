import * as commonLumens from "../common/lumens.js";

let cachedData;

export const handler = function(req, res) {
  res.send(cachedData);
};

function updateApiLumens() {
  Promise.all([
    commonLumens.totalCoins("https://horizon.stellar.org"),
    commonLumens.availableCoins(),
    commonLumens.distributionAll(),
    commonLumens.distributionDirectSignup(),
    commonLumens.distributionBitcoinProgram(),
    commonLumens.distributionPartnershipProgram(),
    commonLumens.distributionBuildChallenge(),
    commonLumens.distributionUserAcquisition(),
  ])
    .then(function([
      totalCoins,
      availableCoins,
      directDevelopment,
      ecosystemSupport,
      useCaseInvestment,
      userAcquisition,
    ]) {
      var response = {
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

      cachedData = response;
      console.log("/api/lumens data saved!");
    })
    .catch(function(err) {
      debugger;
      console.error(err);
      res.sendStatus(500);
    });
}

setInterval(updateApiLumens, 10 * 60 * 1000);
updateApiLumens();
