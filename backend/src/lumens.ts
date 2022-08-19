import { Response, NextFunction } from "express";
import { redisClient, getOrThrow } from "./redis/redisSetup";
import * as commonLumens from "../../common/lumens.js";

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

export async function v1Handler(_: any, res: Response, next: NextFunction) {
  try {
    const cachedData = await getOrThrow(redisClient, "lumensV1");
    const obj: CachedData = JSON.parse(cachedData);
    res.json(obj);
  } catch (e) {
    next(e);
  }
}

export function updateApiLumens() {
  return Promise.all([
    commonLumens.totalSupply(),
    commonLumens.circulatingSupply(),
    commonLumens.directDevelopmentAll(),
    commonLumens.distributionEcosystemSupport(),
    commonLumens.distributionUseCaseInvestment(),
    commonLumens.distributionUserAcquisition(),
  ])
    .then(
      async ([
        totalCoins,
        availableCoins,
        directDevelopment,
        ecosystemSupport,
        useCaseInvestment,
        userAcquisition,
      ]) => {
        const cachedData = {
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
        await redisClient.set("lumensV1", JSON.stringify(cachedData));
        console.log("/api/lumens data saved!");
      },
    )
    .catch((err) => {
      console.error(err);
      return err;
    });
}
