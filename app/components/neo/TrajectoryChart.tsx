'use client';
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { metrics } from '@/lib/neo-mock';

const SERIES = [
  { key: 'brainScore', name: 'Brain Score', color: '#6366f1', unit: 'pts' },
  { key: 'knowledgeNodes', name: 'KB Nodes', color: '#22d3ee', unit: '' },
  { key: 'apiRequests', name: 'API Requests', color: '#10b981', unit: '' },
  { key: 'insights', name: 'Insights', color: '#f59e0b', unit: '' },
] as const;

type SeriesKey = typeof SERIES[number]['key'];

// Normalize each series to 0–100 index so all lines are visible on one axis
function normalizeHistory(history: typeof metrics.history) {
  const mins: Record<string, number> = {};
  const maxs: Record<string, number> = {};
  for (const s of SERIES) {
    const vals = history.map(d => d[s.key]);
    mins[s.key] = Math.min(...vals);
    maxs[s.key] = Math.max(...vals);
  }
  return {
    data: history.map(d => {
      const row: Record<string, number | string> = { date: d.date };
      for (const s of SERIES) {
        const range = maxs[s.key] - mins[s.key] || 1;
        row[`${s.key}_idx`] = Math.round(((d[s.key] - mins[s.key]) / range) * 100);
        row[`${s.key}_raw`] = d[s.key];
      }
      return row;
    }),
    mins,
    maxs,
  };
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; color: string; value: number; payload: Record<string, number> }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f1117', border: '1px solid #1e2130', borderRadius: 8, padding: '10px 14px', fontSize: 11 }}>
      <div style={{ color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      {payload.map(p => {
        const key = p.dataKey.replace('_idx', '') as SeriesKey;
        const series = SERIES.find(s => s.key === key);
        const raw = p.payload[`${key}_raw`];
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: '#94a3b8' }}>{series?.name}:</span>
            <span style={{ color: p.color, fontWeight: 600 }}>
              {typeof raw === 'number' ? raw.toLocaleString() : raw}{series?.unit ? ` ${series.unit}` : ''}
            </span>
            <span style={{ color: '#475569' }}>({p.value}%)</span>
          </div>
        );
      })}
    </div>
  );
}

export function TrajectoryChart() {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(SERIES.map(s => [s.key, true]))
  );
  const { data, mins, maxs } = useMemo(() => normalizeHistory(metrics.history), []);

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-1 flex-wrap">
        {SERIES.map(s => (
          <button key={s.key} onClick={() => setActive(a => ({ ...a, [s.key]: !a[s.key] }))}
            className="text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-2 transition-all"
            style={{ borderColor: 'var(--neo-border)', background: active[s.key] ? 'rgba(255,255,255,0.05)' : 'transparent', opacity: active[s.key] ? 1 : 0.4, color: 'var(--neo-text)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.name}
            <span style={{ fontSize: 9, color: '#475569' }}>
              {mins[s.key].toLocaleString()}–{maxs[s.key].toLocaleString()}
            </span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 10, color: 'var(--neo-faint)', marginBottom: 12 }}>Normalized index 0–100 · hover for actual values</p>
      <div style={{ height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#1e2130" strokeDasharray="2 4" />
            <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={d => String(d).slice(5)} />
            <YAxis stroke="#475569" tick={{ fontSize: 10, fill: '#475569' }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }} />
            {SERIES.map(s => active[s.key] && (
              <Line key={s.key} type="monotone" dataKey={`${s.key}_idx`} name={s.name} stroke={s.color}
                strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
