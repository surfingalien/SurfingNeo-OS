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

// OpenBB cascade pattern: retry with exponential backoff, then cascade to alternate endpoint
async function checkWithRetry(url: string, timeoutMs = 6000, maxAttempts = 3) {
  let attempts = 0;
  const delays = [2000, 4000, 8000];
  while (attempts < maxAttempts) {
    const result = await checkEndpoint(url, timeoutMs);
    if (result.ok) return { ...result, attempts: attempts + 1, fallback: false };
    attempts++;
    if (attempts < maxAttempts) await new Promise(r => setTimeout(r, delays[attempts - 1]));
  }
  return { ok: false, latencyMs: null, statusCode: null, data: null, attempts, fallback: false };
}

async function checkWithCascade(primary: string, alternate: string, timeoutMs = 6000) {
  const result = await checkEndpoint(primary, timeoutMs);
  if (result.ok) return { ...result, attempts: 1, fallback: false };
  // Cascade to alternate endpoint (OpenBB provider fallback pattern)
  const fallbackResult = await checkEndpoint(alternate, timeoutMs);
  return { ...fallbackResult, attempts: 2, fallback: true };
}

export async function GET() {
  const FS = 'https://finsurfing-production.up.railway.app';
  const PE = 'https://prompt-engineering-production-67f2.up.railway.app';

  const [fsHealth, peHealth] = await Promise.all([
    checkWithCascade(`${FS}/health`, `${FS}/api/health`, 6000),
    checkWithRetry(`${PE}/`, 5000, 2),
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
        attempts: fsHealth.attempts,
        fallback: fsHealth.fallback,
      },
      promptEng: {
        url: PE,
        ok: peHealth.ok,
        latencyMs: peHealth.latencyMs,
        statusCode: peHealth.statusCode,
        attempts: peHealth.attempts,
        fallback: peHealth.fallback,
      },
    },
    agenticStats,
    mcpStatus,
  });
}
