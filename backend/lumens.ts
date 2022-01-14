import * as commonLumens from "../common/lumens.js";
import { Response, NextFunction } from "express";
import { redisClient, getOrThrow } from "./redis";

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

export const v1Handler = async function (
  _: any,
  res: Response,
  next: NextFunction,
) {
  try {
    const cachedData = await getOrThrow(redisClient, "lumensV1");
    const obj: CachedData = JSON.parse(cachedData as string);
    res.json(obj);
  } catch (e) {
    next(e);
  }
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
    .then(async function ([
      totalCoins,
      availableCoins,
      directDevelopment,
      ecosystemSupport,
      useCaseInvestment,
      userAcquisition,
    ]) {
      let cachedData = {
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
    })
    .catch(function (err) {
      console.error(err);
      return err;
    });
}
