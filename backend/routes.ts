import express from "express";
import proxy from "express-http-proxy";
import proxyAddr from "proxy-addr";
import logger from "morgan";
import path from "path";
import rateLimit from "express-rate-limit";

import * as lumens from "./lumens";
import * as lumensV2V3 from "./v2v3/lumens";
import * as ledgers from "./ledgers";

export const app = express();
app.set("port", process.env.PORT || 5000);
app.set("json spaces", 2);

// Trust proxy to get real client IPs behind proxies/load balancers.
const defaultTrustProxy = "loopback,linklocal,uniquelocal";
const trustProxyCidrs = (process.env.TRUST_PROXY || defaultTrustProxy)
  .split(",")
  .map((cidr) => cidr.trim())
  .filter(Boolean);

console.log(
  `Setting trust proxy to TRUST_PROXY: ${trustProxyCidrs.join(",")}`,
);
app.set("trust proxy", proxyAddr.compile(trustProxyCidrs));

app.use(logger("combined"));

// Global rate limiting for all requests (including static files)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later.",
    retryAfter: 900, // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.DEV === "true",
});

// Apply global rate limiting to all requests
app.use(globalLimiter);

// Rate limiting configuration
const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "Too Many Requests",
      message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting in development
    skip: () => process.env.DEV === "true",
  });
};

// General API rate limit: 100 requests per 15 minutes
const generalApiLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100,
  "Too many API requests from this IP, please try again later.",
);

// Strict rate limit for resource-intensive endpoints: 20 requests per 5 minutes
const strictApiLimiter = createRateLimit(
  5 * 60 * 1000, // 5 minutes
  20,
  "This endpoint is rate limited due to high resource usage. Please try again later.",
);

// Very strict rate limit for external service endpoints (CoinMarketCap): 10 requests per minute
const externalServiceLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10,
  "This endpoint is heavily rate limited. Please cache responses and avoid frequent requests.",
);

// Apply general rate limiting to all API routes
app.use("/api/", generalApiLimiter);

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

// API Routes with appropriate rate limiting
app.get("/api/ledgers/public", strictApiLimiter, ledgers.handler);
app.get("/api/lumens", lumens.v1Handler);

app.get("/api/v2/lumens", lumensV2V3.v2Handler);
/* For CoinMarketCap - heavily rate limited */
app.get(
  "/api/v2/lumens/total-supply",
  externalServiceLimiter,
  lumensV2V3.v2TotalSupplyHandler,
);
app.get(
  "/api/v2/lumens/circulating-supply",
  externalServiceLimiter,
  lumensV2V3.v2CirculatingSupplyHandler,
);

app.get("/api/v3/lumens", lumensV2V3.v3Handler);
app.get(
  "/api/v3/lumens/all",
  strictApiLimiter,
  lumensV2V3.totalSupplyCheckHandler,
);
/* For CoinMarketCap - heavily rate limited */
app.get(
  "/api/v3/lumens/total-supply",
  externalServiceLimiter,
  lumensV2V3.v3TotalSupplyHandler,
);
app.get(
  "/api/v3/lumens/circulating-supply",
  externalServiceLimiter,
  lumensV2V3.v3CirculatingSupplyHandler,
);

app.listen(app.get("port"), () => {
  console.log("Listening on port", app.get("port"));
});

export async function updateLumensCache() {
  await lumens.updateApiLumens();
  await lumensV2V3.updateApiLumens();
}
