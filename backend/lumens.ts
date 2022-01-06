import * as commonLumens from "../common/lumens.js";
import { Response } from "express";

interface CachedData {
  updatedAt: Date;
  totalCoins: string;
  availableCoins: string;
  programs: {
    directDevelopment: string;
    ecosystemSupport: string;
    useCaseInvestment: string;
    userAcquisition: string;
  };
}

export let cachedData: CachedData;

export const v1Handler = function (_: any, res: Response) {
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
    .then(function ([
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
    .catch(function (err) {
      console.error(err);
      return err;
    });
}
