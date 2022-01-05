import * as redis from "redis";
export const redisClient = redis.createClient();

(async () => {
  redisClient.on("error", (err: Error) =>
    console.error("Redis Client Error", err),
  );
  await redisClient.connect();
  console.log("connected to redis");

  process.on("exit", async function() {
    console.log("closed redis connection");
    await redisClient.quit();
  });
})();
