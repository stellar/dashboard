import { bqClient } from "./bigQuery";
import { getOrThrow, redisClient } from "./redisSetup";

export const bigQueryEndpointBase = "crypto-stellar.crypto_stellar_2";

export async function fetchBigQueryData(query: string) {
  try {
    const [job] = await bqClient.createQueryJob(query);
    console.log("running bq query:", query);
    const [result] = await job.getQueryResults();
    return result;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("QUERY ERROR: ", message);
    return null;
  }
}

export async function fetchCachedData(key: string, query: string) {
  try {
    const cachedData = await getOrThrow(redisClient, key);
    const output = JSON.parse(cachedData);
    return output;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    if (message == "redis key not found") {
      const output = await fetchBigQueryData(query);
      await redisClient.set(key, JSON.stringify(output));
      return output;
    }
    console.error("ERROR: ", message);
  }
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }
}
