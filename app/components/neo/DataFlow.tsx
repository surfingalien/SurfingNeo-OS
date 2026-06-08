'use client';
import { useEffect, useState } from 'react';
import { generateFlowEntry } from '@/lib/neo-mock';

const PLATFORM_COLOR: Record<string, string> = {
  graphify: '#10b981', 'api-brain': '#6366f1', secondary: '#22d3ee',
  mcp: '#a78bfa', webhook: '#f59e0b', sse: '#38bdf8', 'kb-core': '#e879f9', vercel: '#f1f5f9',
};

export function DataFlow() {
  const [entries, setEntries] = useState(() => Array.from({ length: 8 }, generateFlowEntry));
  useEffect(() => {
    const i = setInterval(() => setEntries(e => [generateFlowEntry(), ...e].slice(0, 30)), 1400);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="p-3 h-[200px] overflow-y-auto font-mono text-[11px] space-y-1">
      {entries.map(e => (
        <div key={e.id} className="neo-ticker-entry flex gap-3">
          <span className="tabular-nums shrink-0" style={{ color: 'var(--neo-faint)' }}>{e.ts.toTimeString().slice(0, 8)}</span>
          <span className="uppercase w-20 shrink-0" style={{ color: PLATFORM_COLOR[e.platform] || '#94a3b8' }}>{e.platform}</span>
          <span style={{ color: e.level === 'error' ? '#ef4444' : e.level === 'warn' ? '#f59e0b' : e.level === 'ok' ? '#10b981' : 'var(--neo-muted)' }}>{e.msg}</span>
        </div>
      ))}
    </div>
  );
}
