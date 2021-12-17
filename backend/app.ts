require("babel-register")({
  presets: ["es2015"],
});

// Run backend with interval cache updates.
const { updateLumensCache } = require("./routes");

setInterval(updateLumensCache, 10 * 60 * 1000);
updateLumensCache();
