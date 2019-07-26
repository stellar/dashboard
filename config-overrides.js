const path = require("path");

module.exports = {
  paths: function(paths) {
    paths.appIndexJs = path.resolve(__dirname, "frontend", "app.js");
    paths.appSrc = path.resolve(__dirname, "frontend");
    return paths;
  },
};
