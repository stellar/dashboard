// need to manually import regeneratorRuntime for babel w/ async
// https://github.com/babel/babel/issues/9849#issuecomment-487040428
// require("regenerator-runtime/runtime");
import "regenerator-runtime/runtime";

// Run backend with cache updates.
const { updateLumensCache } = require("./routes");
const { updateLedgers } = require("./ledgers");

(async () => {
  setInterval(updateLumensCache, 10 * 60 * 1000);
  console.log("starting lumens cache update");
  await updateLumensCache();

  if (process.env.UPDATE_DATA == "true") {
    console.log("starting ledgers cache update");
    await updateLedgers();
  }
})();
