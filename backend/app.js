"use strict";
require("babel-register")({
  presets: ["es2015"],
});
var updateLumensCache = require("./routes").updateLumensCache;
setInterval(updateLumensCache, 10 * 60 * 1000);
updateLumensCache();
//# sourceMappingURL=app.js.map
