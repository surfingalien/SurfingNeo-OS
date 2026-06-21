'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { agents } from '@/lib/neo-mock';

const reasoningCapabilities = [
  { label: 'Multi-Agent Parallelism', value: '5 Agents', color: '#6366f1', pct: 100 },
  { label: 'Conflict Surfacing (≥25pt)', value: 'Active', color: '#22d3ee', pct: 100 },
  { label: 'Scan Universe Coverage', value: '30+ Pools', color: '#10b981', pct: 92 },
];

const memoryMetrics = [
  { label: 'Prediction Log (JSONL)', value: '2,847 entries', color: '#6366f1', pct: 85 },
  { label: 'Win-Rate Tracking', value: '1d / 7d / 30d', color: '#a78bfa', pct: 70 },
  { label: 'Skill Cache', value: '14 loaded', color: '#10b981', pct: 50 },
];

const AGENT_ICON_COLORS: Record<string, string> = {
  fundamental: '#10b981',
  technical: '#6366f1',
  sentiment: '#f59e0b',
  macro: '#22d3ee',
  risk: '#ef4444',
  supervisor: '#a78bfa',
};

const BRAIN_STEPS = [
  { icon: '📥', name: 'Signal Input', sub: 'Ticker + universe', color: '#6366f1' },
  { icon: '🤝', name: '5-Agent Parallel', sub: 'Fund / Tech / Sent / Macro / Risk', color: '#22d3ee' },
  { icon: '⚡', name: 'Conflict Engine', sub: 'Spread ≥25pt → primary signal', color: '#a78bfa' },
  { icon: '🧠', name: 'Supervisor Synthesis', sub: 'claude-sonnet-4-6', color: '#10b981' },
  { icon: '✅', name: 'Verdict + Zones', sub: 'Entry / Target / Stop', color: '#f59e0b' },
];

const TOOL_CALLS = [
  { tool: 'market-scanner', agent: 'fundamental', status: 'ok', latency: 342, ts: '14:22:01' },
  { tool: 'reddit-sentiment', agent: 'sentiment', status: 'ok', latency: 88, ts: '14:22:02' },
  { tool: 'fred-series', agent: 'macro', status: 'ok', latency: 211, ts: '14:22:03' },
  { tool: 'edgar-form4', agent: 'fundamental', status: 'ok', latency: 145, ts: '14:22:04' },
  { tool: 'technical-indicators', agent: 'technical', status: 'ok', latency: 67, ts: '14:22:05' },
  { tool: 'risk-scorer', agent: 'risk', status: 'warn', latency: 512, ts: '14:22:06' },
  { tool: 'graphify.query', agent: 'supervisor', status: 'ok', latency: 23, ts: '14:22:07' },
  { tool: 'finra-short', agent: 'fundamental', status: 'ok', latency: 189, ts: '14:22:08' },
];

const MEMORY_CELLS = [
  { type: 'episodic', label: 'Last Signal: AAPL BUY', ts: '14:18', ttl: '24h', heat: 0.9 },
  { type: 'semantic', label: 'Fed Regime: Restrictive', ts: '08:00', ttl: '7d', heat: 0.7 },
  { type: 'procedural', label: 'Scan Template v3.2', ts: '2d ago', ttl: '∞', heat: 0.4 },
  { type: 'episodic', label: 'NVDA conflict → bearish', ts: '13:55', ttl: '24h', heat: 0.85 },
  { type: 'semantic', label: 'VIX < 20 = risk-on', ts: '1d ago', ttl: '7d', heat: 0.6 },
  { type: 'working', label: 'Active: PLTR analysis', ts: 'now', ttl: 'session', heat: 1.0 },
];

const MEMORY_COLORS: Record<string, string> = {
  episodic: '#6366f1', semantic: '#22d3ee', procedural: '#f59e0b', working: '#10b981',
};

const IMPROVEMENT_METRICS = [
  { label: 'Win Rate (7d)', value: '67.4%', delta: '+3.1%', up: true, bar: 67 },
  { label: 'Avg Latency', value: '287ms', delta: '-42ms', up: true, bar: 72 },
  { label: 'Conflict Accuracy', value: '91.2%', delta: '+1.8%', up: true, bar: 91 },
  { label: 'Skill Reuse Rate', value: '43%', delta: '+8%', up: true, bar: 43 },
];

function ProgressRow({ label, value, color, pct }: { label: string; value: string; color: string; pct: number }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '12px', color: 'var(--neo-muted)' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{ height: '100%', background: color, borderRadius: '4px' }}
        />
      </div>
    </div>
  );
}

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      style={{ background: 'var(--neo-surface)', border: '1px solid var(--neo-border)', borderRadius: '14px', padding: '20px' }}
    >
      {children}
    </motion.div>
  );
}

function CardHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
      <span style={{ fontSize: '22px' }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neo-text)' }}>{title}</div>
        <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>{sub}</div>
      </div>
    </div>
  );
}

/* ── Live tool orchestration log ── */
function ToolOrchestrationLog() {
  const [log, setLog] = useState(TOOL_CALLS);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tools = ['binance-ticker', 'graphify.ingest', 'reddit-scan', 'signal-score', 'market-scanner', 'edgar-form4'];
    const ags = ['fundamental', 'technical', 'sentiment', 'macro', 'risk', 'supervisor'];
    const id = setInterval(() => {
      const entry = {
        tool: tools[Math.floor(Math.random() * tools.length)],
        agent: ags[Math.floor(Math.random() * ags.length)],
        status: Math.random() > 0.15 ? 'ok' : 'warn',
        latency: Math.round(20 + Math.random() * 500),
        ts: new Date().toTimeString().slice(0, 8),
      };
      setLog(prev => [...prev.slice(-19), entry]);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

  return (
    <div style={{ height: '200px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}>
      <AnimatePresence initial={false}>
        {log.map((entry, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <span style={{ color: 'var(--neo-faint)', flexShrink: 0 }}>{entry.ts}</span>
            <span style={{ color: AGENT_ICON_COLORS[entry.agent] ?? '#6366f1', flexShrink: 0, fontSize: '9px', fontWeight: 700 }}>
              [{entry.agent.slice(0, 4).toUpperCase()}]
            </span>
            <span style={{ color: 'var(--neo-text)', flex: 1 }}>{entry.tool}</span>
            <span style={{ color: entry.status === 'ok' ? '#10b981' : '#f59e0b', flexShrink: 0 }}>{entry.status}</span>
            <span style={{ color: entry.latency > 300 ? '#f59e0b' : 'var(--neo-muted)', flexShrink: 0 }}>{entry.latency}ms</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}

/* ── Memory heatmap ── */
function MemoryLayer() {
  const [cells, setCells] = useState(MEMORY_CELLS);

  useEffect(() => {
    const id = setInterval(() => {
      setCells(prev => prev.map(c => ({ ...c, heat: Math.max(0.1, Math.min(1, c.heat + (Math.random() - 0.5) * 0.15)) })));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
      {cells.map((cell, i) => {
        const color = MEMORY_COLORS[cell.type] ?? '#6366f1';
        return (
          <motion.div key={i}
            animate={{ opacity: 0.4 + cell.heat * 0.6 }}
            style={{
              padding: '10px', borderRadius: '8px',
              background: color + Math.round(cell.heat * 40).toString(16).padStart(2, '0'),
              border: `1px solid ${color}44`,
            }}>
            <div style={{ fontSize: '9px', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{cell.type}</div>
            <div style={{ fontSize: '11px', color: 'var(--neo-text)', marginBottom: '4px', lineHeight: 1.3 }}>{cell.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--neo-faint)' }}>
              <span>{cell.ts}</span>
              <span>TTL {cell.ttl}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Self-improvement metrics ── */
function SelfImprovement() {
  const [metrics, setMetrics] = useState(IMPROVEMENT_METRICS);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        bar: Math.max(10, Math.min(99, m.bar + (Math.random() - 0.48) * 2)),
      })));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {metrics.map(m => (
        <div key={m.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', color: 'var(--neo-muted)' }}>{m.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: m.up ? '#10b981' : '#ef4444' }}>{m.delta}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--neo-text)' }}>{m.value}</span>
            </div>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${m.bar}%` }}
              transition={{ duration: 0.8, type: 'spring', damping: 20 }}
              style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(to right, var(--neo-primary), var(--neo-secondary))' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgenticBrainPage() {
  return (
    <div className="neo-page-padding">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-primary)', margin: 0 }}>Agentic Brain</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>Reasoning engine · memory · tool orchestration · self-improvement</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>● Online</span>
          <button style={{ fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px', background: 'var(--neo-surface)', color: 'var(--neo-text)', border: '1px solid var(--neo-border)', cursor: 'pointer' }}>⟳ Sync Brain</button>
        </div>
      </div>

      {/* Row 1: 3 cards */}
      <div className="neo-brain-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <Card delay={0}>
          <CardHeader icon="🧠" title="Reasoning Engine" sub="System-2 Thinking" />
          {reasoningCapabilities.map(r => <ProgressRow key={r.label} {...r} />)}
        </Card>
        <Card delay={0.08}>
          <CardHeader icon="🗄️" title="Memory Layer" sub="Graph + Vector Hybrid" />
          {memoryMetrics.map(m => <ProgressRow key={m.label} {...m} />)}
        </Card>
        <Card delay={0.16}>
          <CardHeader icon="👥" title="Agent Team" sub={`${agents.filter(a => a.status === 'active').length} Active Agents`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {agents.map(agent => (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, background: (AGENT_ICON_COLORS[agent.id] ?? '#6366f1') + '22', border: `1px solid ${(AGENT_ICON_COLORS[agent.id] ?? '#6366f1')}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{agent.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neo-text)' }}>{agent.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>{agent.description}</div>
                </div>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: agent.status === 'active' ? '#10b981' : '#94a3b8' }} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Memory heatmap + Tool orchestration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <Card delay={0.2}>
          <CardHeader icon="🔮" title="Memory Cells" sub="Episodic · Semantic · Procedural · Working" />
          <MemoryLayer />
        </Card>
        <Card delay={0.24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>🔧</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neo-text)' }}>Tool Orchestration</div>
                <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>Live MCP invocation log</div>
              </div>
            </div>
            <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }}>● LIVE</span>
          </div>
          <ToolOrchestrationLog />
        </Card>
      </div>

      {/* Row 3: Self-improvement + Brain Architecture */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', marginBottom: '0' }}>
        <Card delay={0.28}>
          <CardHeader icon="📈" title="Self-Improvement" sub="Learning loop metrics" />
          <SelfImprovement />
        </Card>

        {/* Brain Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.32 }}
          style={{ background: 'var(--neo-surface)', border: '1px solid var(--neo-border)', borderRadius: '14px', padding: '22px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--neo-text)' }}>Brain Architecture</div>
            <code style={{ fontSize: '11px', color: 'var(--neo-muted)', fontFamily: 'monospace' }}>claude-sonnet-4-6 + Graphify Context</code>
          </div>

          <div className="neo-brain-steps" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {BRAIN_STEPS.map((step, i) => (
              <>
                <div key={step.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: `1px solid ${step.color}33`, borderRadius: '12px', padding: '16px 10px', textAlign: 'center' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: step.color + '18', border: `1px solid ${step.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '10px' }}>{step.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--neo-text)', marginBottom: '3px' }}>{step.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--neo-muted)' }}>{step.sub}</div>
                </div>
                {i < BRAIN_STEPS.length - 1 && (
                  <div key={`arrow-${i}`} style={{ color: 'var(--neo-muted)', fontSize: '16px', flexShrink: 0 }}>→</div>
                )}
              </>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
