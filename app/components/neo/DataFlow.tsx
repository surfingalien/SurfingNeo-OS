'use client';
import { useEffect, useRef, useState } from 'react';
import { generateFlowEntry } from '@/lib/neo-mock';

const PLATFORM_COLOR: Record<string, string> = {
  graphify: '#10b981', 'api-brain': '#6366f1', secondary: '#22d3ee',
  mcp: '#a78bfa', webhook: '#f59e0b', sse: '#38bdf8', 'kb-core': '#e879f9',
  vercel: '#f1f5f9', finsurfing: '#10b981', promptforge: '#a78bfa',
};

type Entry = { id: string; ts: Date; platform: string; level: string; msg: string };

function parseSSEData(raw: string): Entry | null {
  try {
    const d = JSON.parse(raw);
    return {
      id: d.id ?? crypto.randomUUID(),
      ts: d.ts ? new Date(d.ts) : new Date(),
      platform: d.platform ?? d.type ?? 'sse',
      level: d.level ?? (d.status === 'failed' ? 'error' : 'info'),
      msg: d.msg ?? d.payload ?? d.message ?? JSON.stringify(d),
    };
  } catch { return null; }
}

export function DataFlow({ onRate }: { onRate?: (rateIn: number, rateOut: number) => void }) {
  const [entries, setEntries] = useState<Entry[]>(() => Array.from({ length: 8 }, generateFlowEntry));
  const countRef = useRef(0);
  const sseRef = useRef<EventSource | null>(null);
  const syntheticRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Rate counter — reports events/sec to parent
  useEffect(() => {
    if (!onRate) return;
    const id = setInterval(() => {
      onRate(countRef.current, Math.max(0, countRef.current - 1));
      countRef.current = 0;
    }, 1000);
    return () => clearInterval(id);
  }, [onRate]);

  useEffect(() => {
    let sseOk = false;

    // Try SSE connection
    try {
      const es = new EventSource('/api/stream');
      sseRef.current = es;

      es.onopen = () => { sseOk = true; };

      es.onmessage = (ev) => {
        if (!ev.data || ev.data === ':heartbeat') return;
        const entry = parseSSEData(ev.data);
        if (entry) {
          countRef.current++;
          setEntries(prev => [entry, ...prev].slice(0, 30));
        }
      };

      es.onerror = () => {
        sseOk = false;
        // Fall back to synthetic on SSE error
        if (!syntheticRef.current) {
          syntheticRef.current = setInterval(() => {
            countRef.current++;
            setEntries(prev => [generateFlowEntry(), ...prev].slice(0, 30));
          }, 1000);
        }
      };
    } catch {
      sseOk = false;
    }

    // Always run synthetic at 1s as baseline (deduplicated if SSE is live)
    syntheticRef.current = setInterval(() => {
      if (!sseOk) {
        countRef.current++;
        setEntries(prev => [generateFlowEntry(), ...prev].slice(0, 30));
      }
    }, 1000);

    return () => {
      sseRef.current?.close();
      if (syntheticRef.current) clearInterval(syntheticRef.current);
    };
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
