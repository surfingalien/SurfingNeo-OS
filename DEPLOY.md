# Agentic OS Unified — API + Neural Mesh Visualizer

## Deploy

```bash
cd agentic-os-unified
npm install

# Set all env vars
vercel env add JWT_SECRET
vercel env add ADMIN_API_KEY
vercel env add API_KEYS_JSON
vercel env add GRAPHIFY_API_URL
vercel env add GRAPHIFY_API_KEY
vercel env add MCP_SERVER_URL
vercel env add INTERNAL_API_KEY
vercel env add SITE1_URL
vercel env add SITE1_WEBHOOK_SECRET
vercel env add SITE2_URL
vercel env add SITE2_WEBHOOK_SECRET
vercel env add ANALYTICS_API
vercel env add VERCEL_URL

vercel --prod
```

## Endpoints

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /` | Cookie/JWT | Dashboard UI (Neural Mesh visualizer) |
| `POST /api/auth/token` | API Key | Exchange for JWT |
| `POST /api/graphify/query` | JWT | Query Graphify (circuit breaker + retry) |
| `POST /api/mcp/invoke` | JWT | Invoke MCP tools |
| `GET /api/stream?projectId=` | JWT | SSE real-time updates |
| `POST /api/webhook/ingest` | Signature | Ingest from websites |
| `GET /api/health` | None | System health + circuit states |
| `GET /api/graph` | JWT | Connection topology (Graphify → fallback) |
| `GET /api/metrics` | JWT | Brain health metrics (Graphify → hybrid) |

## Real Data Wiring

The visualizer automatically tries Graphify endpoints first:
- `/api/graph` → calls `GRAPHIFY_API_URL/graph/topology`
- `/api/metrics` → calls `GRAPHIFY_API_URL/metrics/summary`

If Graphify doesn't expose these yet, it falls back to synthetic data with a `source: "synthetic-fallback"` flag.

To wire your real data, add these endpoints to your Graphify server:

```
GET /graph/topology → { nodes: [...], links: [...] }
GET /metrics/summary → { knowledgeBase, apiBrain, secondaryBrain, connections, improvement, history }
```

Or modify `app/api/graph/route.ts` and `app/api/metrics/route.ts` to query your actual database.
