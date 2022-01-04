// need to manually import regeneratorRuntime for babel w/ async
// https://github.com/babel/babel/issues/9849#issuecomment-487040428
// require("regenerator-runtime/runtime");
import "regenerator-runtime/runtime";

// ALEC TODO - move elsewhere?

import * as redis from "redis";
export const redisClient = redis.createClient();

(async () => {
  // ALEC TODO - console.error?
  redisClient.on("error", (err: Error) =>
    console.error("Redis Client Error", err),
  );
  await redisClient.connect();

  await redisClient.set("key", "valueee");

  const value = await redisClient.get("key");
  console.log(value);

  // ALEC TODO - when to close connection?
  // await redisClient.quit();
})();

// Run backend with interval cache updates.
const { updateLumensCache } = require("./routes");

setInterval(updateLumensCache, 10 * 60 * 1000);
updateLumensCache();
