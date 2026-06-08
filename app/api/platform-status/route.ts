import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function checkEndpoint(url: string, timeoutMs = 6000) {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });
    const latencyMs = Date.now() - start;
    let data: unknown;
    try { data = await res.json(); } catch { /* non-JSON */ }
    return { ok: res.ok, latencyMs, statusCode: res.status, data };
  } catch {
    return { ok: false, latencyMs: null, statusCode: null, data: null };
  }
}

export async function GET() {
  const FS = 'https://finsurfing-production.up.railway.app';
  const PE = 'https://prompt-engineering-production-67f2.up.railway.app';

  const [fsHealth, peHealth] = await Promise.all([
    checkEndpoint(`${FS}/health`),
    checkEndpoint(`${PE}/`, 5000),
  ]);

  let agenticStats: unknown = null;
  let mcpStatus: unknown = null;
  if (fsHealth.ok) {
    const [statsRes, mcpRes] = await Promise.all([
      checkEndpoint(`${FS}/api/agentic-os/stats`),
      checkEndpoint(`${FS}/api/agentic-os/mcps`),
    ]);
    if (statsRes.ok) agenticStats = statsRes.data;
    if (mcpRes.ok) mcpStatus = mcpRes.data;
  }

  return NextResponse.json({
    checked: new Date().toISOString(),
    platforms: {
      finsurfing: {
        url: FS,
        ok: fsHealth.ok,
        latencyMs: fsHealth.latencyMs,
        statusCode: fsHealth.statusCode,
        health: fsHealth.data,
      },
      promptEng: {
        url: PE,
        ok: peHealth.ok,
        latencyMs: peHealth.latencyMs,
        statusCode: peHealth.statusCode,
      },
    },
    agenticStats,
    mcpStatus,
  });
}
