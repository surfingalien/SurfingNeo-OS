'use client';
import { health } from '@/lib/neo-mock';

function Breaker({ state }: { state: string }) {
  const style = state === 'CLOSED'
    ? { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }
    : state === 'OPEN'
    ? { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }
    : { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' };
  return <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={style}>{state}</span>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs" style={{ color: 'var(--neo-muted)' }}>{label}</span>
      {children}
    </div>
  );
}

export function SystemStatus() {
  return (
    <div className="p-4 space-y-3">
      <Row label="Graphify"><Breaker state={health.systems.graphify.circuitState.state} /></Row>
      <Row label="MCP"><Breaker state={health.systems.mcp.circuitState.state} /></Row>
      <Row label="Graph Source"><span className="font-mono text-[11px]" style={{ color: 'var(--neo-muted)' }}>graphify-prod-iad1</span></Row>
      <Row label="Metrics Source"><span className="font-mono text-[11px]" style={{ color: 'var(--neo-muted)' }}>vercel-edge</span></Row>
      <Row label="SSE Clients"><span className="font-mono text-[11px]" style={{ color: 'var(--neo-secondary)' }}>{health.systems.sse.connections.totalClients}</span></Row>
      <Row label="Region"><span className="font-mono text-[11px]" style={{ color: 'var(--neo-muted)' }}>us-east-1</span></Row>
    </div>
  );
}
