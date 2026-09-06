# Smart Market Watchlist

**Don't just watch your stocks. Know what changed.**

A hackathon (CODE 2026) full-stack application that goes beyond a normal stock
watchlist. Instead of just showing prices, it compares the current market state
against the state you last saw, decides how *meaningful* each change actually
is, and tells you what deserves your attention and what's safe to ignore.

```
WATCH → CAPTURE STATE → COMPARE → DETECT → SCORE → PRIORITIZE → EXPLAIN
```

---

## 1. Project overview

A normal watchlist says:

```
TCS       ₹3,842   +2.8%
RELIANCE  ₹1,245   -5.4%
HDFC      ₹1,762   +0.4%
```

Smart Market Watchlist says:

```
YOU HAVE 3 THINGS TO KNOW

🔴 Reliance   -5.4%   Volume 3.2x normal        HIGH ATTENTION
🟡 TCS        +3.2%   Earnings event detected    MEDIUM ATTENTION
⚪ HDFC        +0.4%   No meaningful change       SAFE TO IGNORE
```

Every flagged move ships with an explainable 0–100 score, a breakdown of what
contributed to it, and a plain-language "why was this flagged?" explanation
that is always clearly labelled as observed fact vs. inferred explanation.

---

## 2. Architecture

```
                         ┌─────────────────────┐
                         │   MarketDataProvider │  (interface)
                         │  ┌────────────────┐  │
                         │  │ MockProvider    │  │  <- used by default & by demo mode
                         │  │ RealProvider    │  │  <- stub, swap in a vendor
                         │  └────────────────┘  │
                         └──────────┬───────────┘
                                    │ Quote
                                    ▼
                         ┌─────────────────────┐
     background job  ──▶ │  Snapshot Service    │ ──▶ MarketSnapshot (Mongo)
   (every N minutes)     └──────────┬───────────┘
                                    │ previous vs current
                                    ▼
                         ┌─────────────────────┐
                         │  Change Engine        │  deterministic scoring
                         │  (price/volume/       │  0-100 → HIGH/MED/LOW/NONE
                         │   volatility/events)   │
                         └──────────┬───────────┘
                                    │ if meaningful
                                    ▼
                         ┌─────────────────────┐
                         │  MarketChange (Mongo) │  one row per watching user
                         └──────────┬───────────┘
                                    │
                                    ▼
                    Dashboard / Change Feed / Stock Details (React)
```

The **demo/simulate** endpoint (`POST /api/demo/simulate`) pushes a scripted
scenario through this *exact same pipeline* — there is no separate fake UI
for the presentation.

---

## 3. Technology choices

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast dev loop, typed components, small bundle |
| Styling | Tailwind CSS | Rapid, consistent, no component-library lock-in |
| Charts | Recharts | Declarative React charts for price history |
| Backend | Node + Express + TypeScript | Familiar, fast to build REST APIs, typed end to end |
| ORM | Mongoose | Schema validation + indexes on top of MongoDB |
| Auth | JWT + bcrypt | Stateless auth, industry-standard password hashing |
| DB | MongoDB | Flexible schema for a fast-moving hackathon build, native fit for time-series-ish snapshot data |

Deliberately **not** used: Redis, WebSockets, a paid market-data vendor, or an
LLM in the critical path — see [Trade-offs](#9-trade-offs).

---

## 4. The meaningful-change algorithm

Source: `server/src/services/changeEngine/`

Every time a fresh price/volume snapshot is compared against the previous one
for a symbol, four signals are scored and summed into a single 0–100 score:

| Signal | Max points | How it's computed |
|---|---|---|
| Price significance | 35 | `abs(changePercent) / thisStock'sNormalVolatility`, scaled 0.5x→4x of normal into 0-35 points |
| Volume anomaly | 25 | `currentVolume / averageVolume`, scaled 1.2x→4x into 0-25 points |
| Volatility anomaly | 20 | Same ratio as above but a steeper curve (1x→3x), rewards "unusual *for this specific stock*" rather than "big in general" |
| Corporate event | 20 | Points looked up per event type (earnings/merger = 20, dividend = 10, news = 6, etc.) for any event on that symbol in the last 24h |

```
score = min(100, priceSignificance + volumeAnomaly + volatilityAnomaly + corporateEvent)

80-100 → HIGH
50-79  → MEDIUM
20-49  → LOW
0-19   → NONE (not meaningful)
```

Crucially, "normal volatility" is **not a single fixed threshold for every
stock** — it's the standard deviation of that stock's own recent daily
percent-changes (falls back to a configurable default, 1.4%, for symbols
without enough history yet). A stock that normally swings 3% a day needs a
much bigger move to get flagged than one that normally sits at 0.3%.

All weights, thresholds, and event-type point values live in one file:
`server/src/services/changeEngine/config.ts` — nothing else hard-codes a
scoring number.

**Explainability** (`evaluateChange()` return value): every score comes with
an `observed` list (facts: "Price fell 5.4%", "Volume is 3.2x average"), a
`reasons` list (short flags used in the UI), and — only when applicable — a
single `possibleExplanation` string with a `confidence` level. An inferred
cause is never presented as a confirmed fact; if there's no matching event,
the explanation is either omitted or explicitly hedged ("...though the exact
cause is not confirmed").

---

## 5. Database design

Collections (`server/src/models/`): `User`, `Watchlist`, `Stock`,
`MarketSnapshot`, `MarketChange`, `Event`.

- **MarketSnapshot** is a separate, append-only collection rather than being
  embedded in `Stock` — history for a heavily-watched symbol can grow
  unbounded, so it needs its own collection and its own index.
- **MarketChange** is scoped per-user (`userId` + `symbol` + `timestamp`) so
  each user's change feed, read/important/dismissed state, and "since you
  last checked" view are independent even when they watch the same stock.

Indexes:

```js
MarketSnapshot: { symbol: 1, timestamp: -1 }        // "latest history for this symbol"
MarketChange:   { userId: 1, timestamp: -1 }        // "this user's feed, newest first"
MarketChange:   { userId: 1, symbol: 1, timestamp: -1 } // "this user's history for one stock"
Event:          { symbol: 1, timestamp: -1 }
Watchlist:      { userId: 1, name: 1 }
```

---

## 6. Market-data strategy

`server/src/services/marketData/marketDataProvider.ts` defines a single
`MarketDataProvider` interface (`getQuote`, `getQuotes`, `searchStocks`).
Everything else in the app depends only on that interface, resolved once in
`marketData/index.ts` based on `MARKET_DATA_PROVIDER` in `.env`:

- **`mock`** (default) — `MockMarketDataProvider` simulates a small universe
  of 12 NSE-listed stocks with a realistic random walk, and exposes a
  `queueShock()` method the demo endpoint uses to inject a reproducible
  price/volume event.
- **`real`** — `RealMarketDataProvider` is a documented stub with the exact
  method signatures to fill in for a real vendor. If `MARKET_DATA_PROVIDER=real`
  is set but no API key is present, the app automatically falls back to mock
  instead of crashing.

Stock search is debounced client-side (300ms) and cached server-side for 30s
per query, so it doesn't hit the provider on every keystroke.

---

## 7. Data freshness & reconciliation

Every quote carries `status` (`LIVE` / `DELAYED` / `STALE` / `UNAVAILABLE`)
and `marketStatus` (`OPEN` / `CLOSED` / `PRE_MARKET` / `POST_MARKET` /
`UNAVAILABLE`). The UI never fabricates a value — an `UNAVAILABLE` quote
renders an explicit "data unavailable" state instead of a stale-looking
number. Because this build ships with a single provider (mock, or one real
vendor), the multi-provider reconciliation logic described in the brief
(comparing Provider A vs Provider B and flagging a discrepancy) is not
implemented — see Trade-offs.

---

## 8. Scalability notes

- The background job (`server/src/jobs/snapshotJob.ts`) fetches **one quote
  per distinct watched symbol**, not per user — if 10,000 users watch
  RELIANCE, that's still one `getQuote('RELIANCE')` call per cycle, one
  snapshot write, and one `MarketChange` document per watching user (via
  `insertMany`), not 10,000 API calls.
- Search results are cached for 30s per query string.
- Indexes above keep the two hot read paths (a user's feed, a symbol's
  history) index-covered.
- Redis/queueing was intentionally left out at this scale — see Trade-offs.

---

## 9. Trade-offs

Explicitly **not** built, to keep the core "detect → score → explain" loop
sharp instead of diluted:

- **AI summaries** — the optional AI module (config in `.env` as `AI_API_KEY`)
  is not wired up. All scoring, explanation text, and confidence levels come
  from the deterministic engine only. Nothing in the app depends on AI being
  configured.
- **Redis** — not needed at this scale; an in-memory cache map covers stock
  search.
- **Multi-provider reconciliation** — only one active provider is used at a
  time; the interface supports adding a second one later.
- **Notifications / WebSockets** — the dashboard is pull-based (refresh /
  revisit), not push-based.
- **A trading platform, brokerage, or portfolio manager** — explicitly out of
  scope per the brief.

---

## 10. AI usage

None is enabled in this build. If you wire up `AI_API_KEY`, the intended
integration point is: the backend computes every number first (price change,
volume ratio, event detection), and only *that already-computed, structured
data* would be handed to an LLM to phrase a short human-readable summary —
the AI would never be asked to calculate a number or invent market data. See
`server/.env.example` for the placeholder config.

---

## 11. Setup

### Prerequisites
- Node.js 18+
- A MongoDB instance — either [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier is fine) or a local `mongod`.

### 1. Install dependencies

```bash
# from the repo root
npm run install:all
```

(Or manually: `cd server && npm install`, then `cd ../client && npm install`.)

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Open `server/.env` and set at least:
- `MONGODB_URI` — e.g. `mongodb://127.0.0.1:27017/smart-market-watchlist` for local Mongo, or your Atlas connection string.
- `JWT_SECRET` — any long random string.

Everything else has a sane default. **`MARKET_DATA_PROVIDER=mock` is
recommended** — the app is fully functional and demo-ready with zero external
API keys.

### 3. Run it

In one terminal:
```bash
cd server
npm run dev
```

In another terminal:
```bash
cd client
npm run dev
```

Open **http://localhost:5173**. The API runs on **http://localhost:5000**.

### 4. (Optional) seed the stock catalogue

```bash
cd server
npm run seed
```

This just upserts the 12-stock mock universe into the `Stock` collection —
watchlists work without running it too, since stocks are also upserted
lazily the first time they're added to a list.

### 5. Run tests

```bash
cd server
npm test
```

Covers the change-detection engine (the highest-priority test target per the
brief) plus integration tests for auth and the snapshot pipeline's edge cases
(first snapshot, missing data). The integration tests spin up an in-memory
MongoDB via `mongodb-memory-server`, which downloads a MongoDB binary on
first run — this needs outbound internet access once; it's cached after that.

### 6. Production build

```bash
npm run build:server   # compiles server/src -> server/dist
npm run build:client   # compiles + bundles client/src -> client/dist
```

Run the built server with `node server/dist/index.js` (after `npm install --production` in `server/` if deploying).

---

## 12. Demo flow (judges)

1. Open the homepage — the hero states the idea in one line.
2. Click **Try Demo** (goes to registration, then auto-runs the simulation).
3. Land on the dashboard — a demo watchlist (Reliance, TCS, HDFC Bank) is
   already populated.
4. Click **Simulate market changes** any time to re-run the scenario: Reliance
   takes a -5.4% hit on 3.2x volume (HIGH), TCS pops +3.2% on a simulated
   earnings event (MEDIUM), HDFC stays quiet (no flag).
5. Click into Reliance's stock page to see the chart, the flagged change, and
   the "why was this flagged?" breakdown with its score contributors.

This exercises the real backend pipeline end to end — the simulate endpoint
calls the same `recordSnapshotAndDetectChanges()` function the background job
uses for "real" data.

---

## 13. API reference (summary)

All responses use `{ success: true, data }` or `{ success: false, error: { code, message } }`.

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/watchlists
POST   /api/watchlists
PATCH  /api/watchlists/:id
DELETE /api/watchlists/:id
POST   /api/watchlists/:id/stocks
DELETE /api/watchlists/:id/stocks/:symbol

GET    /api/stocks/search?q=
GET    /api/stocks/:symbol

GET    /api/market/:symbol
GET    /api/market/:symbol/history

GET    /api/changes/dashboard-summary
GET    /api/changes?filter=all|price|volume|news|corporate
GET    /api/changes/:id
PATCH  /api/changes/:id/read
PATCH  /api/changes/:id/important
PATCH  /api/changes/:id/dismiss

GET    /api/events/:symbol

POST   /api/demo/simulate
```

All routes except `/api/auth/register` and `/api/auth/login` require
`Authorization: Bearer <token>`.

---

## 14. Project structure

```
smart-market-watchlist/
├── client/            React + TS + Vite + Tailwind frontend
│   └── src/{components,pages,layouts,hooks,services,context,types,utils}
├── server/            Node + Express + TS backend
│   └── src/{controllers,routes,models,services,middleware,utils,jobs,config}
│   └── tests/         Jest unit + integration tests
├── README.md
└── package.json       convenience scripts for both halves
```
