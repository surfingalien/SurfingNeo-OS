import { NextRequest, NextResponse } from 'next/server';
import { CircuitBreaker } from '@/lib/resilience/circuit-breaker';
import { API_CONFIG } from '@/lib/api-config';

const GRAPHIFY_API_URL = API_CONFIG.graphify.baseUrl;
const GRAPHIFY_API_KEY = API_CONFIG.graphify.apiKey ?? 'dev-key';

const breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 15000, halfOpenMaxCalls: 3 });

export const POST = async (req: NextRequest) => {
  let body: { query_type: string; node_id?: string; start?: string; direction?: string; maxDepth?: number; limit?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { query_type } = body;
  if (!query_type) return NextResponse.json({ error: 'query_type is required' }, { status: 400 });

  const isTraversal = query_type === 'bfs' || query_type === 'dfs';
  const endpoint = isTraversal
    ? `${GRAPHIFY_API_URL}/graph/traverse?start=${encodeURIComponent(body.start ?? 'kb-core')}&algorithm=${query_type}&maxDepth=${body.maxDepth ?? 3}&direction=${body.direction ?? 'both'}`
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
      });
      if (!res.ok) throw new Error(`Graphify ${res.status}`);
      return res.json();
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({
      query_type,
      description: 'Graphify unavailable — showing empty result set',
      results: [],
      total: 0,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
};

export const GET = async (req: NextRequest) => {
  const start = req.nextUrl.searchParams.get('start') ?? 'kb-core';
  const maxDepth = Math.min(parseInt(req.nextUrl.searchParams.get('maxDepth') ?? '3'), 6);
  const algorithm = req.nextUrl.searchParams.get('algorithm') ?? 'bfs';
  const direction = req.nextUrl.searchParams.get('direction') ?? 'both';

  const endpoint = `${GRAPHIFY_API_URL}/graph/traverse?start=${encodeURIComponent(start)}&algorithm=${algorithm}&maxDepth=${maxDepth}&direction=${direction}`;

  try {
    const result = await breaker.execute(async () => {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${GRAPHIFY_API_KEY}` },
      });
      if (!res.ok) throw new Error(`Graphify ${res.status}`);
      return res.json();
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Graphify unavailable', fallback: true }, { status: 503 });
  }
};
