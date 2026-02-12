import { Response, NextFunction } from "express";
import { redisClient, getOrThrow } from "./redis";
import * as commonLumens from "../common/lumens.js";

interface CachedData {
  updatedAt: Date;
  totalCoins: string;
  availableCoins: string;
  programs: {
    directDevelopment: string;
    productAndInnovation: string;
    growth: string;
    assetsAndLiquidity: string;
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
    commonLumens.distributionProductAndInnovation(),
    commonLumens.distributionGrowth(),
    commonLumens.distributionAssetsAndLiquidity(),
  ])
    .then(
      async ([
        totalCoins,
        availableCoins,
        directDevelopment,
        productAndInnovation,
        growth,
        assetsAndLiquidity,
      ]) => {
        const cachedData = {
          updatedAt: new Date(),
          totalCoins,
          availableCoins,
          programs: {
            directDevelopment,
            productAndInnovation,
            growth,
            assetsAndLiquidity,
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
