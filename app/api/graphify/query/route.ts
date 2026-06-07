import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { graphifyBreaker } from '@/lib/resilience/circuit-breaker';
import { withRetry } from '@/lib/resilience/retry';
import { API_CONFIG } from '@/lib/api-config';
import { sseManager } from '@/lib/sse/manager';

export const POST = withAuth(async (req: NextRequest, auth) => {
  try {
    const { query, context, projectId } = await req.json();
    if (!auth.projectIds.includes('*') && !auth.projectIds.includes(projectId))
      return NextResponse.json({ error: 'Project access denied' }, { status: 403 });

    const result = await graphifyBreaker.execute(
      () => withRetry(async () => {
        const response = await fetch(`${API_CONFIG.graphify.baseUrl}/query`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_CONFIG.graphify.apiKey}`, 'X-Source': 'dashboard', 'X-User-Id': auth.userId },
          body: JSON.stringify({ query, context, projectId }),
        });
        if (!response.ok) { const e = await response.json().catch(() => ({})); throw new Error(e.message || `HTTP ${response.status}`); }
        return response.json();
      }, { maxRetries: 2, onRetry: (err, a) => console.warn(`Graphify retry ${a} for ${projectId}:`, err.message) }),
      { cached: true, data: null, fallback: true }
    );

    sseManager.broadcastToProject(projectId, { type: 'graphify_update', query, result: result.fallback ? null : result });
    return NextResponse.json({ success: !result.fallback, data: result.fallback ? null : result, circuitState: graphifyBreaker.getState(), timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, circuitState: graphifyBreaker.getState(), retryAfter: graphifyBreaker.getState().lastFailure ? Math.ceil((graphifyBreaker.getState().lastFailure! + 15000 - Date.now()) / 1000) : null }, { status: 503 });
  }
}, 'admin');