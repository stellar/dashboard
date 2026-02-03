# Tech Stack Overview

The Stellar Dashboard can be viewed at
[dashboard.stellar.org](https://dashboard.stellar.org).

## Architecture at a Glance

This is a **full-stack JavaScript/TypeScript application** with:

- **Frontend**: React SPA (Single Page Application)
- **Backend**: Node.js/Express API server
- **Build Tool**: Vite
- **Package Manager**: npm

## Frontend Stack

**Purpose**: Dashboard UI displaying Stellar network metrics and data
visualization

We use `muicss` library for the UI. It hasn't been updated in years, so it holds
us back from upgrading all dependencies to the latest versions.

`react-d3-components` library was replaced by `d3`, which is used to build
charts.

## Backend Stack

**Purpose**: Serve API data, cache Stellar network metrics, proxy requests, and
connect to BigQuery

### Key Responsibilities

- **Cache Updates**: Periodically updates Stellar network data (lumens supply,
  ledger stats)
- **API Proxy**: Proxies requests to `/api/*` (via Vite in dev, Express in
  production)
- **Data Aggregation**: Fetches data from Stellar API and BigQuery
- **Rate limiting**: Rate limit is IP based and there are both endpoint-specific
  and global limits

### Environment Variables

```bash
UPDATE_DATA=true        # Enable periodic cache updates
DEV=true                # Development mode
BQ_PROJECT_ID=...       # BigQuery project ID used by backend/bigQuery.ts
REDIS_URL=...           # Production Redis connection URL used by backend/redis.ts
PORT=5000               # Server port configuration (defaults to 5000) used by backend/routes.ts
TRUST_PROXY=...         # Trusted proxy CIDRs configuration used by backend/routes.ts

```

---

## Pinned Security Resolutions

```json
{
  "resolutions": {
    "**/ua-parser-js": "0.7.28" // Prevents vulnerable versions
  }
}
```

This pins `ua-parser-js` to prevent dependency vulnerabilities.

---

## External Services & APIs

### Stellar Network

- **Stellar SDK** queries the Stellar blockchain
- Fetches account data, transaction metrics, network stats

### Google Cloud BigQuery

- Stores historical ledger & transaction data
- Used for long-term trend analysis
- Requires service account JSON configuration

### Redis Cache

- **Port**: 6379 (default)
- **Purpose**: Store computed metrics to reduce repeated API calls
- **Required for**: Backend data updates

---

## Build & Deployment

### Deployment Platforms

- **Heroku**: Configured via `Procfile` and `heroku-postbuild` script
- **Docker**: `Dockerfile` available for containerized deployment

### Environment

- **Node.js version**: 22.x (specified in `engines`)

---

## Key Architectural Patterns

### Frontend-Backend Communication

```
Frontend (React)
    ↓ (HTTP requests via Axios)
Vite Dev Proxy (dev) / Express (prod)
    ↓ (backend/routes.ts)
External APIs (Stellar SDK, BigQuery, Redis)
```

### Data Flow for Metrics

1. Backend periodically fetches data from Stellar API
2. Computes aggregates (e.g., lumens in circulation)
3. Caches results in Redis
4. Frontend requests cached data via `/api/*` endpoints
5. Charts and widgets update in real-time

### Caching Strategy

- **Redis**: Primary cache for hot data
- **In-memory**: Some computed values cached in process
- **Update frequency**: 10-minute intervals (configurable)
