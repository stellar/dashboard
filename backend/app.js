import express from "express";
import proxy from "express-http-proxy";
import logger from "morgan";

import * as lumens from "./lumens.js";
import * as lumensV2 from "./v2/lumens.js";
import * as lumensV3 from "./v3/lumens.js";
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
app.get("/api/lumens", lumens.handler);

app.get("/api/v2/lumens", lumensV2.handler);
/* For CoinMarketCap */
app.get("/api/v2/lumens/total-supply", lumensV2.totalSupplyHandler);
app.get("/api/v2/lumens/circulating-supply", lumensV2.circulatingSupplyHandler);

app.get("/api/v3/lumens", lumensV3.handler);
app.get("/api/v3/lumens/all", lumensV3.totalSupplyCheckHandler);
/* For CoinMarketCap */
app.get("/api/v3/lumens/total-supply", lumensV3.totalSupplyHandler);
app.get("/api/v3/lumens/circulating-supply", lumensV3.circulatingSupplyHandler);

app.listen(app.get("port"), function() {
  console.log("Listening on port", app.get("port"));
});

export function updateLumensCache() {
  lumens.updateApiLumens();
  lumensV2.updateApiLumens();
  lumensV3.updateApiLumens();
}
setInterval(updateLumensCache, 10 * 60 * 1000);
updateLumensCache();
