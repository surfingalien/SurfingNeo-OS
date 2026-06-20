'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateEvent } from '@/lib/neo-mock';

const TYPES = ['all', 'graphify', 'webhook', 'mcp', 'error'] as const;
type FilterType = typeof TYPES[number];

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  error:   { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
  graphify:{ bg: 'rgba(16,185,129,0.15)',  text: '#10b981' },
  mcp:     { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa' },
  webhook: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
};

export function EventStream() {
  const [events, setEvents] = useState(() => Array.from({ length: 6 }, generateEvent));
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const i = setInterval(() => setEvents(e => [generateEvent(), ...e].slice(0, 40)), 1800);
    return () => clearInterval(i);
  }, []);

  const filtered = events.filter(e => filter === 'all' || e.type === filter);

  const counts = TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = t === 'all' ? events.length : events.filter(e => e.type === t).length;
    return acc;
  }, {});

  return (
    <div className="p-3">
      <div className="flex gap-1 mb-2 flex-wrap">
        {TYPES.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md transition-colors flex items-center gap-1"
            style={{ background: filter === t ? 'rgba(99,102,241,0.2)' : 'transparent', color: filter === t ? 'var(--neo-primary)' : 'var(--neo-muted)' }}>
            {t}
            {counts[t] > 0 && (
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '1px 4px', borderRadius: '8px',
                background: filter === t ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)',
                color: filter === t ? 'var(--neo-primary)' : 'var(--neo-faint)',
                minWidth: '16px', textAlign: 'center',
              }}>{counts[t]}</span>
            )}
          </button>
        ))}
      </div>
      <div className="h-[220px] overflow-y-auto space-y-1 font-mono text-[11px]">
        <AnimatePresence initial={false}>
          {filtered.map(e => {
            const c = TYPE_COLOR[e.type] ?? { bg: 'rgba(255,255,255,0.06)', text: 'var(--neo-muted)' };
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, x: -14, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="neo-ticker-entry flex items-start gap-2 p-2 rounded-md border overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(30,33,48,0.6)' }}>
                <span className="px-1.5 py-0.5 rounded text-[9px] uppercase shrink-0"
                  style={{ background: c.bg, color: c.text }}>{e.type}</span>
                <span className="flex-1" style={{ color: 'var(--neo-muted)' }}>{e.payload}</span>
                <span className="shrink-0" style={{ color: 'var(--neo-faint)' }}>{e.ts.toTimeString().slice(0, 8)}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
