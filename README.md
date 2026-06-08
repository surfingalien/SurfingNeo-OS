# SurfingNeo-OS

Real-time visualization dashboard for the SurfingNeo-OS agentic network — connecting the Knowledge Base, API Brain, Secondary Brain, FinSurfing, and Prompt Engineering platforms into a unified live mesh.

## What It Does

SurfingNeo-OS provides a single-pane view of how every node in your agentic ecosystem connects, the health of each component, and live progress metrics — all updating in real time.

| Panel | Description |
|-------|-------------|
| **Connection Topology** | Interactive force-directed graph of all nodes and links. Click to inspect, drag to reposition, scroll to zoom. |
| **Platform Mesh** | Health scores, latency, request counts, and top endpoints for FinSurfing, Prompt Engineering, Graphify, and MCP. |
| **30-Day Trajectory** | Toggleable time-series chart of Knowledge Base growth, API requests, insights generated, and overall Brain Score. |
| **Live Data Flow** | Scrolling ticker of real-time events across all platforms — blends live SSE with synthetic activity. |
| **Brain Health** | Per-component scores with circuit breaker states, error rates, latency percentiles, and accuracy metrics. |

## Architecture

```
Browser Dashboard
    │
    ├── GET /api/graph      → Graphify /graph/topology  → synthetic fallback
    ├── GET /api/metrics    → Graphify /metrics/summary → hybrid fallback
    ├── GET /api/platforms  → Graphify /platforms/status → synthetic fallback
    ├── GET /api/health     → live circuit breaker state
    └── GET /api/stream     → SSE live event stream (requires auth)

Authenticated endpoints (JWT / API key):
    ├── POST /api/graphify/query
    ├── POST /api/mcp/invoke
    └── POST /api/webhook/ingest
```

Data flows from Graphify when available. If Graphify is unreachable, the system degrades gracefully — the dashboard still shows topology and metrics, flagged as `source: "synthetic-fallback"` until connectivity is restored.

## Stack

- **Next.js 14** (App Router) — frontend and API layer in one project
- **Canvas API** — zero-dependency force graph and chart rendering
- **Server-Sent Events** — real-time push from server to browser
- **Circuit breakers** — automatic fallback when upstream services fail
- **JWT + API key auth** — for webhook ingestion and write endpoints

## Getting Started

```bash
git clone https://github.com/surfingalien/SurfingNeo-OS
cd SurfingNeo-OS
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret for signing/verifying JWTs |
| `API_KEYS_JSON` | JSON map of API keys to roles, e.g. `{"key123":{"role":"service","projectIds":["*"]}}` |
| `GRAPHIFY_API_URL` | Base URL of your Graphify server (default: `http://localhost:3001`) |
| `GRAPHIFY_API_KEY` | API key for Graphify requests |
| `MCP_SERVER_URL` | Base URL of your MCP server (default: `http://localhost:3002`) |
| `SITE1_URL` / `SITE1_TOKEN` | FinSurfing or other webhook source |
| `SITE2_URL` / `SITE2_TOKEN` | Secondary webhook source |

## Connecting Real Data

**Option A — Add endpoints to your Graphify server:**

```typescript
app.get('/graph/topology', (req, res) => {
  res.json({
    nodes: [{ id: 'kb-core', label: 'Knowledge Base', type: 'brain', status: 'active', edges: 156, size: await db.nodes.count() }],
    links: [{ source: 'kb-core', target: 'api-brain', strength: 0.95, type: 'bidirectional', traffic: 1240 }],
  });
});

app.get('/metrics/summary', (req, res) => {
  res.json({
    knowledgeBase: { totalNodes: await db.nodes.count(), growthRate: 12.4 },
    apiBrain: { totalRequests: await getRequestCount(), avgLatencyMs: 45 },
  });
});
```

**Option B — Replace the fallback with a direct DB query** in `app/api/metrics/route.ts`.

## Deployment

Deploy to Vercel in one command:

```bash
vercel deploy --prod
```

Set environment variables via `vercel env add` or the Vercel dashboard under **Settings → Environment Variables**.

## License

MIT © 2026 surfingalien
