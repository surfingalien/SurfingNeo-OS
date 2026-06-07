import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { mcpBreaker } from '@/lib/resilience/circuit-breaker';
import { withRetry } from '@/lib/resilience/retry';

export const POST = withAuth(async (req: NextRequest, auth) => {
  try {
    const { toolName, arguments: args, serverName } = await req.json();
    const result = await mcpBreaker.execute(
      () => withRetry(async () => {
        const response = await fetch(`${process.env.MCP_SERVER_URL}/invoke`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}` },
          body: JSON.stringify({ toolName, arguments: args, serverName }),
        });
        if (!response.ok) throw new Error(`MCP: ${response.status}`); return response.json();
      }, { maxRetries: 2 }),
      { fallback: true, error: 'MCP unavailable' }
    );
    if (result.fallback) return NextResponse.json({ success: false, error: result.error, circuitState: mcpBreaker.getState() }, { status: 503 });
    return NextResponse.json({ success: true, result, circuitState: mcpBreaker.getState() });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}, 'admin');