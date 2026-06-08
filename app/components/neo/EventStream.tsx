'use client';
import { useEffect, useState } from 'react';
import { generateEvent } from '@/lib/neo-mock';

const TYPES = ['all', 'graphify', 'webhook', 'mcp', 'error'] as const;
type FilterType = typeof TYPES[number];

export function EventStream() {
  const [events, setEvents] = useState(() => Array.from({ length: 6 }, generateEvent));
  const [filter, setFilter] = useState<FilterType>('all');
  useEffect(() => {
    const i = setInterval(() => setEvents(e => [generateEvent(), ...e].slice(0, 40)), 1800);
    return () => clearInterval(i);
  }, []);
  const filtered = events.filter(e => filter === 'all' || e.type === filter);
  return (
    <div className="p-3">
      <div className="flex gap-1 mb-2 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md transition-colors"
            style={{ background: filter === t ? 'rgba(99,102,241,0.2)' : 'transparent', color: filter === t ? 'var(--neo-primary)' : 'var(--neo-muted)' }}>
            {t}
          </button>
        ))}
      </div>
      <div className="h-[220px] overflow-y-auto space-y-1 font-mono text-[11px]">
        {filtered.map(e => (
          <div key={e.id} className="neo-ticker-entry flex items-start gap-2 p-2 rounded-md border"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(30,33,48,0.6)' }}>
            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase shrink-0"
              style={{
                background: e.type === 'error' ? 'rgba(239,68,68,0.15)' : e.type === 'graphify' ? 'rgba(16,185,129,0.15)' : e.type === 'mcp' ? 'rgba(167,139,250,0.15)' : 'rgba(245,158,11,0.15)',
                color: e.type === 'error' ? '#ef4444' : e.type === 'graphify' ? '#10b981' : e.type === 'mcp' ? '#a78bfa' : '#f59e0b',
              }}>{e.type}</span>
            <span className="flex-1" style={{ color: 'var(--neo-muted)' }}>{e.payload}</span>
            <span className="shrink-0" style={{ color: 'var(--neo-faint)' }}>{e.ts.toTimeString().slice(0, 8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
