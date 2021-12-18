import * as commonLumens from "../common/lumens.js";

// ALEC TODO - check these string types are correct
interface CachedData {
  updatedAt: Date;
  totalCoins: number;
  availableCoins: number;
  programs: {
    directDevelopment: string;
    ecosystemSupport: string;
    useCaseInvestment: string;
    userAcquisition: string;
  };
}

export let cachedData: CachedData;

export const v1Handler = function({}, res: any) {
  res.send(cachedData);
};

export function updateApiLumens() {
  return Promise.all([
    commonLumens.totalSupply(),
    commonLumens.circulatingSupply(),
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
      cachedData = {
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
    })
    .catch(function(err) {
      console.error(err);
      return err;
    });
}
