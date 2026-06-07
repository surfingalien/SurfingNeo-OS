import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { graphifyBreaker } from '@/lib/resilience/circuit-breaker';
import { withRetry } from '@/lib/resilience/retry';
import { API_CONFIG } from '@/lib/api-config';

export const GET = withAuth(async (req: NextRequest, auth) => {
  try {
    // Try to fetch real graph topology from Graphify
    const graphifyData = await graphifyBreaker.execute(
      () => withRetry(async () => {
        const res = await fetch(`${API_CONFIG.graphify.baseUrl}/graph/topology`, {
          headers: { 'Authorization': `Bearer ${API_CONFIG.graphify.apiKey}`, 'X-User-Id': auth.userId },
        });
        if (!res.ok) throw new Error(`Graphify: ${res.status}`);
        return res.json();
      }, { maxRetries: 1 }),
      null // fallback to synthetic
    );

    if (graphifyData && !graphifyData.fallback) {
      return NextResponse.json({ ...graphifyData, source: 'graphify-live', generatedAt: new Date().toISOString() });
    }

    // FALLBACK: Synthetic topology based on known system architecture
    const nodes = [
      { id: 'kb-core', label: 'Knowledge Base Core', type: 'brain', status: 'active', edges: 12, size: 2847 },
      { id: 'api-brain', label: 'API Brain', type: 'brain', status: 'active', edges: 8, size: 1563 },
      { id: 'secondary-brain', label: 'Secondary Brain', type: 'brain', status: 'active', edges: 6, size: 982 },
      { id: 'graphify', label: 'Graphify Engine', type: 'engine', status: graphifyBreaker.getState().state === 'CLOSED' ? 'active' : 'warning', edges: 15, size: 5120 },
      { id: 'mcp-claude', label: 'Claude MCP', type: 'interface', status: mcpBreaker.getState().state === 'CLOSED' ? 'active' : 'warning', edges: 4, size: 320 },
      { id: 'vercel-api', label: 'Vercel API Layer', type: 'infrastructure', status: 'active', edges: 10, size: 890 },
      { id: 'site-1', label: process.env.SITE1_NAME || 'Website 1', type: 'source', status: 'active', edges: 3, size: 445 },
      { id: 'site-2', label: process.env.SITE2_NAME || 'Website 2', type: 'source', status: 'active', edges: 2, size: 210 },
      { id: 'memory-space', label: 'Memory Space', type: 'storage', status: 'active', edges: 5, size: 1200 },
      { id: 'skill-registry', label: 'SKILL.md Registry', type: 'storage', status: 'active', edges: 7, size: 650 },
    ];

    const links = [
      { source: 'kb-core', target: 'api-brain', strength: 0.95, type: 'bidirectional', traffic: 1240 },
      { source: 'api-brain', target: 'secondary-brain', strength: 0.88, type: 'bidirectional', traffic: 856 },
      { source: 'kb-core', target: 'graphify', strength: 0.92, type: 'bidirectional', traffic: 2100 },
      { source: 'api-brain', target: 'graphify', strength: 0.85, type: 'bidirectional', traffic: 1680 },
      { source: 'secondary-brain', target: 'graphify', strength: 0.78, type: 'bidirectional', traffic: 920 },
      { source: 'api-brain', target: 'mcp-claude', strength: 0.90, type: 'bidirectional', traffic: 640 },
      { source: 'vercel-api', target: 'api-brain', strength: 0.82, type: 'unidirectional', traffic: 3400 },
      { source: 'vercel-api', target: 'graphify', strength: 0.75, type: 'unidirectional', traffic: 2800 },
      { source: 'site-1', target: 'vercel-api', strength: 0.70, type: 'unidirectional', traffic: 560 },
      { source: 'site-2', target: 'vercel-api', strength: 0.65, type: 'unidirectional', traffic: 320 },
      { source: 'memory-space', target: 'kb-core', strength: 0.80, type: 'bidirectional', traffic: 430 },
      { source: 'skill-registry', target: 'api-brain', strength: 0.72, type: 'unidirectional', traffic: 210 },
      { source: 'skill-registry', target: 'mcp-claude', strength: 0.65, type: 'bidirectional', traffic: 180 },
      { source: 'mcp-claude', target: 'secondary-brain', strength: 0.60, type: 'unidirectional', traffic: 320 },
    ];

    return NextResponse.json({ nodes, links, source: 'synthetic-fallback', generatedAt: new Date().toISOString(), warning: 'Graphify /graph/topology not available — showing synthetic topology' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, 'readonly');