import * as commonLumens from "../common/lumens.js";
import { Response } from "express";
import { redisClient } from "./app";

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

export const v1Handler = async function(_: any, res: Response) {
  try {
    // // ALEC TODO - needs to have await?
    let cachedData = await redisClient.get("lumensV1");
    let obj: CachedData = JSON.parse(cachedData || "");
    res.json(obj);
  } catch (e) {
    console.error(e);
    res.json("");
  }
};

export async function updateApiLumens() {
  return Promise.all([
    commonLumens.totalSupply(),
    commonLumens.circulatingSupply(),
    commonLumens.directDevelopmentAll(),
    commonLumens.distributionEcosystemSupport(),
    commonLumens.distributionUseCaseInvestment(),
    commonLumens.distributionUserAcquisition(),
  ])
    .then(async function([
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
    .catch(function(err) {
      console.error(err);
      return err;
    });
}
