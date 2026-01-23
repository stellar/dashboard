import "dotenv/config";

// Run backend with cache updates.
import { app, updateLumensCache } from "./routes";
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

function startServer() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  app.listen(app.get("port"), () => {
    console.log("Listening on port", app.get("port"));
  });
}

beginCacheUpdates();
startServer();
