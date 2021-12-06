import express from "express";
import proxy from "express-http-proxy";
import logger from "morgan";

import * as lumens from "./lumens.js";
// import * as lumensV2 from "./v2/lumens.js";
// import * as lumensV3 from "./v3/lumens.js";
import * as ledgers from "./ledgers.js";

var app = express();
app.set("port", process.env.PORT || 5000);
app.set("json spaces", 2);

app.use(logger("combined"));

if (process.env.DEV) {
  app.use(
    "/",
    proxy("localhost:3000", {
      filter: function(req, res) {
        return (
          req.path == "/" ||
          req.path.indexOf(".js") >= 0 ||
          req.path.indexOf(".html") >= 0 ||
          req.path.indexOf(".css") >= 0
        );
      },
    }),
  );
} else {
  app.use(express.static("dist"));
}

app.get("/api/ledgers/public", ledgers.handler);
app.get("/api/lumens", lumens.v1Handler);

app.get("/api/v2/lumens", lumens.v2Handler);
/* For CoinMarketCap */
app.get("/api/v2/lumens/total-supply", lumens.v2TotalSupplyHandler);
app.get("/api/v2/lumens/circulating-supply", lumens.v2CirculatingSupplyHandler);

app.get("/api/v3/lumens", lumens.v3Handler);
app.get("/api/v3/lumens/all", lumens.totalSupplyCheckHandler);
/* For CoinMarketCap */
app.get("/api/v3/lumens/total-supply", lumens.v3TotalSupplyHandler);
app.get("/api/v3/lumens/circulating-supply", lumens.v3CirculatingSupplyHandler);

app.listen(app.get("port"), function() {
  console.log("Listening on port", app.get("port"));
});

export async function updateLumensCache() {
  await lumens.updateApiLumens();
  // await lumensV2.updateApiLumens();
  // await lumensV3.updateApiLumens();
}
setInterval(updateLumensCache, 10 * 60 * 1000);
updateLumensCache();
