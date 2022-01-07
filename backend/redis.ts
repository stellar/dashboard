import * as redis from "redis";

const redisUrl = process.env.DEV
  ? "redis://localhost:6379"
  : "redis://stellar-dashboard-redis:6379";

export const redisClient = redis.createClient({ url: redisUrl });

(async () => {
  redisClient.on("error", (err: Error) =>
    console.error("Redis Client Error", err),
  );
  await redisClient.connect();
  console.log("connected to redis");

  process.on("exit", async function () {
    console.log("closed redis connection");
    await redisClient.quit();
  });
})();
