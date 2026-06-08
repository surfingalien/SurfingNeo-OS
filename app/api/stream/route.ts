import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
import { sseManager } from '@/lib/sse/manager';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId') || 'public';

  // Auth is optional — authenticated users can scope to their project,
  // unauthenticated browsers join the public channel.
  const auth = await verifyAuth(req);
  if (auth && !auth.projectIds.includes('*') && !auth.projectIds.includes(projectId)) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response(new ReadableStream({
    start(controller) {
      const clientId = sseManager.addClient(projectId, controller);
      const heartbeat = setInterval(() => {
        try { controller.enqueue(new TextEncoder().encode(':heartbeat\n\n')); }
        catch { clearInterval(heartbeat); sseManager.removeClient(clientId); }
      }, 30000);
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        sseManager.removeClient(clientId);
      });
    },
  }), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
