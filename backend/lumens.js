import * as commonLumens from "../common/lumens.js";

// let cachedData = {
//   updatedAt: "2019-11-04T19:03:21.898Z",
//   totalCoins: "105443902087.3472865",
//   availableCoins: "20054779553.6822807",
//   distributedCoins: "8772645809.0519286",
//   programs: {
//     directProgram: "5435066959.8964838",
//     bitcoinProgram: "2037756769.6575473",
//     partnershipProgram: "1138014496.4978975",
//     buildChallenge: "161807583",
//   },
// };

let cachedData;

export const handler = function(req, res) {
  res.send(cachedData);
};

function updateApiLumens() {
  Promise.all([
    commonLumens.postBurnTotalCoins("https://horizon.stellar.org"),
    commonLumens.availableCoins(),
    commonLumens.directDevelopmentAll(),
    commonLumens.distributionEcosystemSupport(),
    commonLumens.distributionUseCaseInvestment(),
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
      console.error(err);
      res.sendStatus(500);
    });
}

setInterval(updateApiLumens, 10 * 60 * 1000);
updateApiLumens();
