// need to manually import regeneratorRuntime for babel w/ async
// https://github.com/babel/babel/issues/9849#issuecomment-487040428
// require("regenerator-runtime/runtime");
import "regenerator-runtime/runtime";

import "dotenv/config";

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
