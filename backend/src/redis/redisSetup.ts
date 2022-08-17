import { createClient } from "redis";

// recommended to use typeof for RedisClientType:
// https://github.com/redis/node-redis/issues/1673#issuecomment-979866376
export type RedisClientType = typeof redisClient;

const redisUrl = process.env.DEV
  ? "redis://127.0.0.1:6379"
  : process.env.REDIS_URL;

export const redisClient = createClient({ url: redisUrl });

(async () => {
  redisClient.on("error", (err: Error) =>
    console.error("Redis Client Error", err),
  );
  await redisClient.connect();
  console.log("connected to redis");

  process.on("exit", async () => {
    console.log("closed redis connection");
    await redisClient.quit();
  });
})();

export async function getOrThrow(
  rc: RedisClientType,
  key: string,
  shouldThrow: boolean = true,
) {
  const cachedData = await rc.get(key);
  if (cachedData == null && shouldThrow) {
    throw new Error("redis key not found");
  }
  return cachedData;
}

export async function clearRedisData(rc: RedisClientType, key: string) {
  rc.del(key);
}
