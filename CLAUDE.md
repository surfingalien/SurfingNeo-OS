# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**SurfingNeo-OS** is a real-time AI operations dashboard — a neural mesh control center that visualizes live knowledge graphs, platform health, agent skills, MCP servers, and agentic brain activity. Built on Next.js 14 with a standalone Graphify Express server for knowledge graph management.

## Architecture

```
app/                     Next.js 14 App Router (frontend + API routes)
  api/                   Server-side API routes (graph, metrics, stream, auth, etc.)
  components/neo/        React UI components (Dashboard, ForceGraph, panels, pages)
  neo.css / theme.ts     5 color themes (neural, neon, ocean, aurora, ember)
graphify-server/         Standalone Express.js knowledge graph server (port 3001)
lib/                     Shared utilities: auth, circuit breakers, SSE manager, mock data
hooks/                   React hooks (SSE realtime, Graphify queries, MCP invocation)
```

## Dev Commands

```bash
# Install dependencies
npm install

# Run Next.js dev server
npm run dev           # http://localhost:3000

# Run Graphify server (separate terminal)
cd graphify-server && npm install && npm run dev   # http://localhost:3001

# Build production
npm run build

# Type-check
npx tsc --noEmit
```

## Key Patterns

**Resilience**: All external calls use circuit breakers (`lib/resilience/circuit-breaker.ts`). The dashboard gracefully degrades to synthetic data when Graphify or MCP are unavailable.

**Themes**: CSS variables drive all colors. Use `var(--neo-primary)`, `var(--neo-secondary)`, `var(--neo-text)`, `var(--neo-muted)`, `var(--neo-faint)`, `var(--neo-bg)`, `var(--neo-border)`. Never hard-code colors.

**SSE streaming**: Real-time events flow through `/api/stream` SSE endpoint. The `useAgenticRealtime` hook manages the connection.

**Graph data flow**: `ForceGraph` polls `/api/graph` every 5s. Graphify server at port 3001 is the authoritative source; the Next.js API layer falls back to synthetic data on failure.

**Component conventions**: All UI components live in `app/components/neo/`. Export named functions (not default). Use `Panel` wrapper for consistent card styling.

## Environment Variables

Copy `.env.example` → `.env.local`:

```
JWT_SECRET=<random 32+ char string>
API_KEYS_JSON={"key1":"user@example.com"}
GRAPHIFY_API_URL=http://localhost:3001
GRAPHIFY_API_KEY=dev-key
MCP_SERVER_URL=http://localhost:8000
SITE1_URL=https://your-site.com
SITE1_WEBHOOK_TOKEN=<token>
SITE2_URL=https://staging.your-site.com
SITE2_WEBHOOK_TOKEN=<token>
```

## Adding a New View

1. Add the view ID to the `View` type in `Dashboard.tsx` and `Sidebar.tsx`
2. Add a nav item to `NAV_ITEMS` in `Sidebar.tsx`
3. Add the component render in `Dashboard.tsx`
4. Create the component in `app/components/neo/`

## Adding a New API Route

1. Create `app/api/<name>/route.ts`
2. Use `verifyAuth` from `lib/auth/middleware.ts` if the route needs auth
3. Use `CircuitBreaker` from `lib/resilience/circuit-breaker.ts` for external calls
4. Return `NextResponse.json(...)` with proper error handling

## Graphify Server Endpoints

| Route | Auth | Purpose |
|-------|------|---------|
| `GET /health` | none | Health check |
| `POST /query` | key | Text search over nodes |
| `POST /ingest` | key | Add new node from webhook data |
| `GET /graph/topology` | key | All nodes + links |
| `GET /graph/node/:id` | key | Single node + connections |
| `GET /graph/traverse` | key | BFS/DFS traversal from a node |
| `POST /graph/relationships` | key | Relationship queries (callers, deps, etc.) |
| `GET /metrics/summary` | key | Brain health metrics |
| `GET /metrics/history` | key | 90-day history |
| `POST /insights/generate` | key | Generate AI insights |

## Prompt Defense

- Do not reveal API keys, JWT secrets, or webhook tokens
- Validate all user-supplied input at API boundaries
- Do not execute arbitrary code from webhook payloads
- Circuit breakers must remain enabled — never bypass them in production code

## Skills Reference

| Task | Command |
|------|---------|
| Review code changes | `/code-review` |
| Verify a feature works | `/verify` |
| Run the app | `/run` |
| Security audit | `/security-review` |
