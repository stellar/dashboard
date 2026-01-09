import express from "express";
import proxy from "express-http-proxy";
import logger from "morgan";
import path from "path";

import * as lumens from "./lumens";
import * as lumensV2V3 from "./v2v3/lumens";
import * as ledgers from "./ledgers";

export const app = express();
app.set("port", process.env.PORT || 5000);
app.set("json spaces", 2);

app.use(logger("combined"));

if (process.env.DEV) {
  // Development: proxy to Vite dev server
  app.use(
    "/",
    proxy("localhost:3000", {
      filter: (req, _) =>
        req.path === "/" ||
        req.path.indexOf(".js") >= 0 ||
        req.path.indexOf(".html") >= 0 ||
        req.path.indexOf(".css") >= 0,
    }),
  );
} else {
  // Production: serve built static files
  // Determine the correct static directory based on environment
  let staticDir: string;

  if (process.cwd().endsWith("/dist")) {
    // Docker environment: already in dist directory
    staticDir = ".";
  } else {
    // Heroku/other environments: serve from dist directory
    staticDir = path.join(__dirname, "..", "..", "dist");
  }

  console.log(`Serving static files from: ${path.resolve(staticDir)}`);

  // Verify the static directory exists and contains expected files
  try {
    const fs = require("fs");
    const indexPath = path.join(staticDir, "index.html");
    if (!fs.existsSync(indexPath)) {
      console.error(`ERROR: index.html not found at ${indexPath}`);
      console.error(
        'Make sure to run "npm run build" before starting the server',
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("ERROR: Unable to verify static directory:", error);
    process.exit(1);
  }

  // Serve static files with security headers and restrictions
  app.use(
    express.static(staticDir, {
      // Security options
      dotfiles: "deny", // Don't serve hidden files (.env, .git, etc.)
      index: "index.html",
      maxAge: "1d", // Cache static assets for 1 day
      // Restrict to specific file extensions for security
      extensions: [
        "html",
        "js",
        "css",
        "png",
        "jpg",
        "jpeg",
        "gif",
        "ico",
        "svg",
        "woff",
        "woff2",
        "ttf",
        "eot",
      ],
      setHeaders: (res, filePath) => {
        // Add security headers
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Set appropriate cache headers based on file type
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (
          filePath.match(
            /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/,
          )
        ) {
          res.setHeader("Cache-Control", "public, max-age=86400, immutable"); // 1 day with immutable
        }
      },
    }),
  );

  // Fallback to index.html for SPA routing (must come after API routes)
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) {
      return next();
    }

    // Only serve index.html for GET requests to prevent issues with other HTTP methods
    if (req.method !== "GET") {
      return next();
    }

    // Serve index.html for all other routes (SPA routing)
    const indexPath = path.join(path.resolve(staticDir), "index.html");
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  });
}

app.get("/api/ledgers/public", ledgers.handler);
app.get("/api/lumens", lumens.v1Handler);

app.get("/api/v2/lumens", lumensV2V3.v2Handler);
/* For CoinMarketCap */
app.get("/api/v2/lumens/total-supply", lumensV2V3.v2TotalSupplyHandler);
app.get(
  "/api/v2/lumens/circulating-supply",
  lumensV2V3.v2CirculatingSupplyHandler,
);

app.get("/api/v3/lumens", lumensV2V3.v3Handler);
app.get("/api/v3/lumens/all", lumensV2V3.totalSupplyCheckHandler);
/* For CoinMarketCap */
app.get("/api/v3/lumens/total-supply", lumensV2V3.v3TotalSupplyHandler);
app.get(
  "/api/v3/lumens/circulating-supply",
  lumensV2V3.v3CirculatingSupplyHandler,
);

app.listen(app.get("port"), () => {
  console.log("Listening on port", app.get("port"));
});

export async function updateLumensCache() {
  await lumens.updateApiLumens();
  await lumensV2V3.updateApiLumens();
}
