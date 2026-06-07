import { NextResponse } from 'next/server';
import { graphifyBreaker, mcpBreaker } from '@/lib/resilience/circuit-breaker';
import { sseManager } from '@/lib/sse/manager';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    systems: {
      graphify: { status: graphifyBreaker.getState().state === 'CLOSED' ? 'healthy' : 'degraded', circuitState: graphifyBreaker.getState() },
      mcp: { status: mcpBreaker.getState().state === 'CLOSED' ? 'healthy' : 'degraded', circuitState: mcpBreaker.getState() },
      sse: { status: 'healthy', connections: sseManager.getStats() },
    },
  });
}