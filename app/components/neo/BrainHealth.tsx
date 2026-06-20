'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { metrics as mockMetrics } from '@/lib/neo-mock';

interface BrainMetrics {
  knowledgeBase: { totalNodes: number; totalEdges: number; growthRate: number };
  apiBrain: { avgLatencyMs: number; errorRate: number; uptimePercent: number };
  secondaryBrain: { insightsGenerated: number; accuracyScore: number };
  improvement: {
    apiBrain: { score: number; trend: number };
    secondaryBrain: { score: number; trend: number };
    knowledgeGraph: { score: number; trend: number };
    overall: { score: number; trend: number };
  };
}

function Ring({ score }: { score: number }) {
  const r = 52, c = 2 * Math.PI * r;
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="#1e2130" strokeWidth="8" fill="none" />
        <motion.circle cx="60" cy="60" r={r} stroke="url(#neo-g)" strokeWidth="8" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * score) / 100 }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }} />
        <defs>
          <linearGradient id="neo-g" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--neo-primary)" />
            <stop offset="100%" stopColor="var(--neo-secondary)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          key={score}
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl font-bold tabular-nums" style={{ color: 'var(--neo-text)' }}>{score}</motion.div>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--neo-muted)' }}>overall</div>
      </div>
    </div>
  );
}

function SubScore({ name, score, trend, lines }: { name: string; score: number; trend: number; lines: string[] }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <div className="text-xs font-medium" style={{ color: 'var(--neo-text)' }}>{name}</div>
        <div className="flex items-baseline gap-1.5">
          <motion.span key={score} initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}
            className="text-sm font-bold tabular-nums" style={{ color: 'var(--neo-text)' }}>{score}</motion.span>
          <span className={`text-[10px] font-mono ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend > 0 ? '▲' : '▼'}{Math.abs(trend).toFixed(1)}
          </span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: 'var(--neo-border)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 14, delay: 0.2 }}
          className="h-full" style={{ background: 'linear-gradient(to right, var(--neo-primary), var(--neo-secondary))' }} />
      </div>
      <div className="flex gap-3 text-[10px] font-mono" style={{ color: 'var(--neo-muted)' }}>
        {lines.map(l => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

export function BrainHealth() {
  const [m, setM] = useState<BrainMetrics>(mockMetrics);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/metrics');
        if (!res.ok) return;
        const data = await res.json();
        setM(data);
      } catch { /* keep last value */ }
    };
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-center mb-4"><Ring score={m.improvement.overall.score} /></div>
      <div className="space-y-4">
        <SubScore name="API Brain" score={m.improvement.apiBrain.score} trend={m.improvement.apiBrain.trend}
          lines={[`${m.apiBrain.avgLatencyMs}ms`, `err ${(m.apiBrain.errorRate * 100).toFixed(2)}%`, `up ${m.apiBrain.uptimePercent}%`]} />
        <SubScore name="Secondary Brain" score={m.improvement.secondaryBrain.score} trend={m.improvement.secondaryBrain.trend}
          lines={[`${m.secondaryBrain.insightsGenerated} ins`, `acc ${(m.secondaryBrain.accuracyScore * 100).toFixed(0)}%`, `gpt-4o`]} />
        <SubScore name="Knowledge Graph" score={m.improvement.knowledgeGraph.score} trend={m.improvement.knowledgeGraph.trend}
          lines={[`${m.knowledgeBase.totalNodes} nodes`, `${m.knowledgeBase.totalEdges} edges`, `+${m.knowledgeBase.growthRate}%`]} />
      </div>
    </div>
  );
}
