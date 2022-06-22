import "dotenv/config";

// Run backend with cache updates.
import { updateLumensCache } from "./routes";
import { updateLedgers } from "./ledgers/data";

async function beginCacheUpdates() {
  if (process.env.UPDATE_DATA === "true") {
    setInterval(updateLumensCache, 10 * 60 * 1000);
    console.log("starting lumens cache update");
    await updateLumensCache();

    console.log("[TESTNET] starting ledgers cache update");
    await updateLedgers(true);
    console.log("[MAINNET] starting ledgers cache update");
    await updateLedgers(false);
  }
}

beginCacheUpdates();
