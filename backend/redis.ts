import * as redis from "redis";

const redisUrl = process.env.DEV
  ? "redis://127.0.0.1:6379"
  : process.env.REDIS_URL;

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
