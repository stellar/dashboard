import * as redis from "redis";
export const redisClient = redis.createClient();

(async () => {
  redisClient.on("error", (err: Error) =>
    console.error("Redis Client Error", err),
  );
  await redisClient.connect();
  console.log("connected to redis");

  // ALEC TODO - needed?
  process.on("exit", async function() {
    console.log("closing redis connection");
    await redisClient.quit();
  });
})();
