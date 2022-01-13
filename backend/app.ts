// need to manually import regeneratorRuntime for babel w/ async
// https://github.com/babel/babel/issues/9849#issuecomment-487040428
// require("regenerator-runtime/runtime");
import "regenerator-runtime/runtime";

// Run backend with interval cache updates.
const { updateLumensCache } = require("./routes");
const { updateLedgers } = require("./ledgers");

setInterval(updateLumensCache, 10 * 60 * 1000);
updateLumensCache();
updateLedgers();
