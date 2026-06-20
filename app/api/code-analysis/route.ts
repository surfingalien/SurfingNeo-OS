import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { CircuitBreaker } from '@/lib/resilience/circuit-breaker';
import { API_CONFIG } from '@/lib/api-config';

const GRAPHIFY_API_URL = API_CONFIG.graphify.baseUrl;
const GRAPHIFY_API_KEY = API_CONFIG.graphify.apiKey ?? 'dev-key';

const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 15000, halfOpenMaxCalls: 3 });

export async function POST(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { query_type: string; node_id?: string; start?: string; algorithm?: string; direction?: string; maxDepth?: number; limit?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { query_type } = body;

  // Route to appropriate Graphify endpoint based on query type
  const isTraversal = query_type === 'bfs' || query_type === 'dfs';
  const endpoint = isTraversal
    ? `${GRAPHIFY_API_URL}/graph/traverse?start=${body.start}&algorithm=${query_type}&maxDepth=${body.maxDepth ?? 3}&direction=${body.direction ?? 'both'}`
    : `${GRAPHIFY_API_URL}/graph/relationships`;

  try {
    const result = await breaker.execute(async () => {
      const res = await fetch(endpoint, {
        method: isTraversal ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GRAPHIFY_API_KEY}`,
        },
        body: isTraversal ? undefined : JSON.stringify({ query_type, node_id: body.node_id, limit: body.limit ?? 20 }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Graphify ${res.status}`);
      return res.json();
    });
    return NextResponse.json(result);
  } catch {
    // Fallback: return mock relationship data so the UI degrades gracefully
    return NextResponse.json({
      query_type,
      description: 'Graphify unavailable — showing cached topology data',
      results: [],
      total: 0,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const start = url.searchParams.get('start') ?? 'kb-core';
  const maxDepth = Math.min(parseInt(url.searchParams.get('maxDepth') ?? '3'), 6);
  const algorithm = url.searchParams.get('algorithm') ?? 'bfs';
  const direction = url.searchParams.get('direction') ?? 'both';

  const endpoint = `${GRAPHIFY_API_URL}/graph/traverse?start=${start}&algorithm=${algorithm}&maxDepth=${maxDepth}&direction=${direction}`;

  try {
    const result = await breaker.execute(async () => {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${GRAPHIFY_API_KEY}` },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Graphify ${res.status}`);
      return res.json();
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Graphify unavailable', fallback: true }, { status: 503 });
  }
}
