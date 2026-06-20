'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LiveMetrics {
  knowledgeBase: { totalNodes: number; totalEdges: number; growthRate: number };
  apiBrain: { totalRequests: number; avgLatencyMs: number; uptimePercent: number };
  secondaryBrain: { insightsGenerated: number; accuracyScore: number };
  improvement: { overall: { score: number; trend: number } };
  connections: { mcpInvocationsToday: number; sseClients: number };
  source: string;
}

function useAnimatedNumber(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(start + diff * ease));
      if (t < 1) raf = requestAnimationFrame(step);
      else prev.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

function KPICell({ label, value, unit = '', trend, sub, pulse = false }: {
  label: string; value: number; unit?: string; trend?: number; sub?: string; pulse?: boolean;
}) {
  const displayed = useAnimatedNumber(value);
  const [flash, setFlash] = useState(false);
  const prevVal = useRef(value);

  useEffect(() => {
    if (value !== prevVal.current) { setFlash(true); setTimeout(() => setFlash(false), 700); prevVal.current = value; }
  }, [value]);

  return (
    <div style={{
      flex: '0 0 auto', minWidth: '120px', padding: '10px 14px',
      borderRight: '1px solid var(--neo-border)',
      display: 'flex', flexDirection: 'column', gap: '2px',
    }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--neo-faint)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {pulse && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <motion.span
          animate={{ color: flash ? 'var(--neo-primary)' : 'var(--neo-text)' }}
          transition={{ duration: 0.3 }}
          style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}
        >
          {displayed.toLocaleString()}
        </motion.span>
        {unit && <span style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>{unit}</span>}
        {trend !== undefined && (
          <span style={{ fontSize: '10px', color: trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : 'var(--neo-muted)', display: 'flex', alignItems: 'center', gap: '1px', marginLeft: '2px' }}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--neo-faint)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{sub}</div>}
    </div>
  );
}

export function StatsBar() {
  const [data, setData] = useState<LiveMetrics | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/metrics');
        if (!res.ok) return;
        const json = await res.json();
        setData(json);
        setLastFetch(new Date());
      } catch { /* keep last data */ }
    };
    fetch_();
    const id = setInterval(fetch_, 15000);
    return () => clearInterval(id);
  }, []);

  if (!data) return (
    <div style={{
      display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--neo-border)',
      padding: '12px 16px', gap: '8px', overflowX: 'hidden',
    }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ flex: 1, minWidth: '80px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderBottom: '1px solid var(--neo-border)',
          background: 'rgba(255,255,255,0.015)',
          overflowX: 'auto',
        }}
        className="neo-stats-scroll"
      >
        <div style={{ display: 'flex', alignItems: 'stretch', minWidth: 'max-content' }}>
          <KPICell
            label="Knowledge Nodes" pulse
            value={data.knowledgeBase.totalNodes}
            sub={`+${data.knowledgeBase.growthRate}%/mo · ${data.knowledgeBase.totalEdges} edges`}
            trend={data.knowledgeBase.growthRate}
          />
          <KPICell
            label="API Requests"
            value={data.apiBrain.totalRequests}
            sub={`${data.apiBrain.avgLatencyMs}ms avg · ${data.apiBrain.uptimePercent}% up`}
          />
          <KPICell
            label="Insights"
            value={data.secondaryBrain.insightsGenerated}
            sub={`${(data.secondaryBrain.accuracyScore * 100).toFixed(0)}% accuracy`}
          />
          <KPICell
            label="Brain Score"
            value={data.improvement.overall.score}
            unit="pts"
            trend={data.improvement.overall.trend}
            sub={lastFetch ? `updated ${lastFetch.toTimeString().slice(0, 8)}` : ''}
          />
          <KPICell
            label="MCP Calls"
            value={data.connections.mcpInvocationsToday}
            sub={`${data.connections.sseClients} SSE · ${data.source}`}
          />
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <div style={{
              fontSize: '9px', fontFamily: 'monospace', padding: '3px 7px', borderRadius: '4px',
              background: data.source === 'graphify-live' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.1)',
              color: data.source === 'graphify-live' ? '#10b981' : 'var(--neo-muted)',
              border: `1px solid ${data.source === 'graphify-live' ? 'rgba(16,185,129,0.3)' : 'var(--neo-border)'}`,
            }}>
              {data.source === 'graphify-live' ? '● LIVE' : '○ HYBRID'}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
