import { NextRequest, NextResponse } from 'next/server';
import { graphifyBreaker, mcpBreaker } from '@/lib/resilience/circuit-breaker';
import { API_CONFIG } from '@/lib/api-config';
import { withRetry } from '@/lib/resilience/retry';

export const GET = async (_req: NextRequest) => {
  const gb = graphifyBreaker.getState();
  const mb = mcpBreaker.getState();

  // Try to fetch live platform status from Graphify
  let liveData: any = null;
  try {
    liveData = await graphifyBreaker.execute(
      () => withRetry(async () => {
        const res = await fetch(`${API_CONFIG.graphify.baseUrl}/platforms/status`, {
          headers: { 'Authorization': `Bearer ${API_CONFIG.graphify.apiKey}` },
        });
        if (!res.ok) throw new Error(`Graphify: ${res.status}`);
        return res.json();
      }, { maxRetries: 1 }),
      null
    );
  } catch { /* fallback */ }

  const now = Date.now();

  const platforms = {
    source: liveData ? 'graphify-live' : 'synthetic-fallback',
    generatedAt: new Date(now).toISOString(),
    finsurfing: {
      id: 'finsurfing',
      name: 'FinSurfing',
      status: liveData?.finsurfing?.status || 'active',
      latencyMs: liveData?.finsurfing?.latencyMs || 38,
      requestsToday: liveData?.finsurfing?.requestsToday || 8420,
      lastSync: liveData?.finsurfing?.lastSync || new Date(now - 45000).toISOString(),
      endpoints: liveData?.finsurfing?.endpoints || [
        { path: '/api/portfolio/analyze', calls: 1240, avgMs: 42 },
        { path: '/api/market/signals', calls: 3100, avgMs: 28 },
        { path: '/api/risk/score', calls: 890, avgMs: 61 },
        { path: '/api/surf/session', calls: 1920, avgMs: 35 },
        { path: '/api/insights/generate', calls: 1270, avgMs: 88 },
      ],
      dataFlowMbps: liveData?.finsurfing?.dataFlowMbps || 2.4,
      healthScore: liveData?.finsurfing?.healthScore || 94,
    },
    promptEngineering: {
      id: 'prompt-eng',
      name: 'Prompt Engineering Platform',
      status: liveData?.promptEngineering?.status || 'active',
      latencyMs: liveData?.promptEngineering?.latencyMs || 52,
      requestsToday: liveData?.promptEngineering?.requestsToday || 3860,
      lastSync: liveData?.promptEngineering?.lastSync || new Date(now - 120000).toISOString(),
      endpoints: liveData?.promptEngineering?.endpoints || [
        { path: '/api/prompt/optimize', calls: 870, avgMs: 110 },
        { path: '/api/template/render', calls: 1540, avgMs: 45 },
        { path: '/api/chain/execute', calls: 680, avgMs: 290 },
        { path: '/api/eval/run', calls: 480, avgMs: 340 },
        { path: '/api/context/compress', calls: 290, avgMs: 75 },
      ],
      dataFlowMbps: liveData?.promptEngineering?.dataFlowMbps || 0.8,
      healthScore: liveData?.promptEngineering?.healthScore || 89,
    },
    graphify: {
      id: 'graphify',
      name: 'Graphify Engine',
      status: gb.state === 'CLOSED' ? 'active' : gb.state === 'HALF_OPEN' ? 'degraded' : 'error',
      circuitState: gb.state,
      failures: gb.failures,
      latencyMs: liveData?.graphify?.latencyMs || 22,
      requestsToday: liveData?.graphify?.requestsToday || 12480,
      healthScore: gb.state === 'CLOSED' ? 97 : gb.state === 'HALF_OPEN' ? 60 : 0,
    },
    mcp: {
      id: 'mcp',
      name: 'Claude MCP',
      status: mb.state === 'CLOSED' ? 'active' : mb.state === 'HALF_OPEN' ? 'degraded' : 'error',
      circuitState: mb.state,
      failures: mb.failures,
      toolsAvailable: liveData?.mcp?.toolsAvailable || 4,
      invocationsToday: liveData?.mcp?.invocationsToday || 156,
      healthScore: mb.state === 'CLOSED' ? 99 : mb.state === 'HALF_OPEN' ? 55 : 0,
    },
    integrationLinks: liveData?.integrationLinks || [
      { from: 'finsurfing', to: 'kb-core', label: 'market data → KB', trafficMbps: 1.2, bidirectional: true },
      { from: 'finsurfing', to: 'api-brain', label: 'portfolio signals → API Brain', trafficMbps: 0.8, bidirectional: false },
      { from: 'prompt-eng', to: 'secondary-brain', label: 'prompt chains → Secondary Brain', trafficMbps: 0.3, bidirectional: true },
      { from: 'prompt-eng', to: 'mcp', label: 'tool calls → MCP', trafficMbps: 0.1, bidirectional: false },
      { from: 'graphify', to: 'kb-core', label: 'graph sync', trafficMbps: 2.1, bidirectional: true },
      { from: 'mcp', to: 'api-brain', label: 'tool results', trafficMbps: 0.4, bidirectional: false },
    ],
  };

  return NextResponse.json(platforms);
};
