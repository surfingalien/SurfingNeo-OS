'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { metrics } from '@/lib/neo-mock';

const SERIES = [
  { key: 'brainScore', name: 'Brain Score', color: '#6366f1' },
  { key: 'knowledgeNodes', name: 'KB Nodes', color: '#22d3ee' },
  { key: 'apiRequests', name: 'API Requests', color: '#10b981' },
  { key: 'insights', name: 'Insights', color: '#f59e0b' },
] as const;

export function TrajectoryChart() {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(SERIES.map(s => [s.key, true]))
  );
  return (
    <div className="p-4">
      <div className="flex gap-2 mb-3 flex-wrap">
        {SERIES.map(s => (
          <button key={s.key} onClick={() => setActive(a => ({ ...a, [s.key]: !a[s.key] }))}
            className="text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-2 transition-all"
            style={{ borderColor: 'var(--neo-border)', background: active[s.key] ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: active[s.key] ? 1 : 0.4, color: 'var(--neo-text)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
      </div>
      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={metrics.history} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#1e2130" strokeDasharray="2 4" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={d => d.slice(5)} />
            <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} />
            <Tooltip contentStyle={{ background: '#0f1117', border: '1px solid #1e2130', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94a3b8' }} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }} />
            {SERIES.map(s => active[s.key] && (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color}
                strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
