// Run backend with cache updates.
import { updateLumensCache } from "./routes";
import { updateLedgers } from "./ledgers";

async function beginCacheUpdates() {
  if (process.env.UPDATE_DATA === "true") {
    setInterval(updateLumensCache, 10 * 60 * 1000);
    console.log("starting lumens cache update");
    await updateLumensCache();

    console.log("starting ledgers cache update");
    await updateLedgers();
  }
}

beginCacheUpdates();
