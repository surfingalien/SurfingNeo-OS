import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { graphifyBreaker } from '@/lib/resilience/circuit-breaker';
import { withRetry } from '@/lib/resilience/retry';
import { sseManager } from '@/lib/sse/manager';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  return signature === `sha256=${expected}`;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const signature = req.headers.get('x-webhook-signature');
    const eventType = req.headers.get('x-webhook-event') || 'unknown';
    const siteName = req.headers.get('x-site-name') || 'unknown';
    const payload = await req.text();
    const secret = process.env[`${siteName.toUpperCase()}_WEBHOOK_SECRET`];
    if (secret && signature && !verifySignature(payload, signature, secret))
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    const data = JSON.parse(payload);
    const enriched = { ...data, _meta: { siteName, eventType, receivedAt: new Date().toISOString(), processingTime: 0 } };

    const graphifyResult = await graphifyBreaker.execute(
      () => withRetry(async () => {
        const res = await fetch(`${process.env.GRAPHIFY_API_URL}/ingest`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GRAPHIFY_API_KEY}` }, body: JSON.stringify(enriched) });
        if (!res.ok) throw new Error(`Graphify: ${res.status}`); return res.json();
      }, { maxRetries: 2 }),
      { queued: true, retryLater: true }
    );

    enriched._meta.processingTime = Date.now() - startTime;
    const projectId = data.projectId || 'default';
    const eventPayload = { type: 'webhook_ingested', eventType, siteName, graphifyStatus: graphifyResult.queued ? 'queued' : 'ingested', data: enriched };
    sseManager.broadcastToProject(projectId, eventPayload);
    sseManager.broadcastToProject('public', eventPayload);

    if (['error', 'deploy', 'critical'].includes(eventType)) {
      fetch(`${process.env.VERCEL_URL}/api/mcp/invoke`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.INTERNAL_API_KEY! },
        body: JSON.stringify({ toolName: 'generate_insights', arguments: { projectId: data.projectId, insightType: eventType === 'error' ? 'anomalies' : 'trends', dataSources: ['graphify', 'logs'] }, serverName: 'agentic-os' }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, ingested: !graphifyResult.queued, queued: graphifyResult.queued || false, processingMs: enriched._meta.processingTime });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.message, retryable: true }, { status: 500 }); }
}