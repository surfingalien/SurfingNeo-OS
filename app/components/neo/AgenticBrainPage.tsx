'use client';
import { motion } from 'framer-motion';
import { agents, graphifySchema, obsidianGit } from '@/lib/neo-mock';

const reasoningCapabilities = [
  { label: 'Multi-Agent Parallelism', value: '5 Agents', color: '#6366f1', pct: 100 },
  { label: 'Conflict Surfacing (≥25pt)', value: 'Active', color: '#22d3ee', pct: 100 },
  { label: 'Scan Universe Coverage', value: '30+ Pools', color: '#10b981', pct: 92 },
];

const memoryMetrics = [
  { label: 'Prediction Log (JSONL)', value: '2,847 entries', color: '#6366f1', pct: 85 },
  { label: 'Win-Rate Tracking', value: '1d / 7d / 30d', color: '#a78bfa', pct: 70 },
  { label: 'Skill Cache', value: '22 loaded', color: '#10b981', pct: 55 },
];

const graphifyMemory = [
  { label: 'Graph Nodes', value: graphifySchema.stats.totalNodes.toLocaleString(), color: '#22d3ee', pct: 82 },
  { label: 'Graph Edges', value: graphifySchema.stats.totalEdges.toLocaleString(), color: '#6366f1', pct: 70 },
  { label: 'Token Reduction', value: graphifySchema.stats.tokenReduction, color: '#10b981', pct: 95 },
];

const AGENT_ICON_COLORS: Record<string, string> = {
  fundamental: '#10b981',
  technical: '#6366f1',
  sentiment: '#f59e0b',
  macro: '#22d3ee',
  risk: '#ef4444',
  supervisor: '#a78bfa',
  'graph-agent': '#22d3ee',
  'data-agent': '#f0b90b',
};

const BRAIN_STEPS = [
  { icon: '📥', name: 'Signal Input', sub: 'Ticker + universe', color: '#6366f1' },
  { icon: '🤝', name: '5-Agent Parallel', sub: 'Fund / Tech / Sent / Macro / Risk', color: '#22d3ee' },
  { icon: '⚡', name: 'Conflict Engine', sub: 'Spread ≥25pt → primary signal', color: '#a78bfa' },
  { icon: '🧠', name: 'Supervisor Synthesis', sub: 'claude-sonnet-4-6', color: '#10b981' },
  { icon: '✅', name: 'Verdict + Zones', sub: 'Entry / Target / Stop', color: '#f59e0b' },
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
      style={{
        background: 'var(--neo-surface)',
        border: '1px solid var(--neo-border)',
        borderRadius: '14px',
        padding: '20px',
      }}
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

export function AgenticBrainPage() {
  return (
    <div className="neo-page-padding">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-primary)', margin: 0 }}>Agentic Brain</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>Core reasoning engine, memory, and orchestration layer</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)',
          }}>● Online</span>
          <button style={{
            fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '8px',
            background: 'var(--neo-surface)', color: 'var(--neo-text)',
            border: '1px solid var(--neo-border)', cursor: 'pointer',
          }}>⟳ Sync Brain</button>
        </div>
      </div>

      {/* 3-column cards */}
      <div className="neo-brain-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {/* Reasoning Engine */}
        <Card delay={0}>
          <CardHeader icon="🧠" title="Reasoning Engine" sub="System-2 Thinking" />
          {reasoningCapabilities.map(r => <ProgressRow key={r.label} {...r} />)}
        </Card>

        {/* Memory Layer */}
        <Card delay={0.08}>
          <CardHeader icon="🗄️" title="Memory Layer" sub="Graph + Vector Hybrid" />
          {memoryMetrics.map(m => <ProgressRow key={m.label} {...m} />)}
        </Card>

        {/* Agent Team */}
        <Card delay={0.16}>
          <CardHeader icon="👥" title="Agent Team" sub={`${agents.filter(a => a.status === 'active').length} Active Agents`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {agents.map(agent => (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                  background: (AGENT_ICON_COLORS[agent.id] ?? '#6366f1') + '22',
                  border: `1px solid ${(AGENT_ICON_COLORS[agent.id] ?? '#6366f1')}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>{agent.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neo-text)' }}>{agent.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>{agent.description}</div>
                </div>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: agent.status === 'active' ? '#10b981' : '#94a3b8',
                }} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Brain Architecture */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.24 }}
        style={{
          background: 'var(--neo-surface)',
          border: '1px solid var(--neo-border)',
          borderRadius: '14px',
          padding: '22px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--neo-text)' }}>Brain Architecture</div>
          <code style={{ fontSize: '11px', color: 'var(--neo-muted)', fontFamily: 'monospace' }}>claude-sonnet-4-6 + Graphify Context</code>
        </div>

        <div className="neo-brain-steps" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {BRAIN_STEPS.map((step, i) => (
            <>
              <div
                key={step.name}
                style={{
                  flex: 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${step.color}33`,
                  borderRadius: '12px',
                  padding: '16px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: step.color + '18', border: `1px solid ${step.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', marginBottom: '10px',
                }}>{step.icon}</div>
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

      {/* Memory Layers — Graphify + Obsidian Git */}
      <div className="neo-brain-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        {/* Graphify Knowledge Graph */}
        <Card delay={0.3}>
          <CardHeader icon="🕸️" title="Graphify Knowledge Layer" sub={`${graphifySchema.stats.totalNodes.toLocaleString()} nodes · ${graphifySchema.stats.communities} communities · ${graphifySchema.stats.tokenReduction} token reduction`} />
          {graphifyMemory.map(m => <ProgressRow key={m.label} {...m} />)}
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {graphifySchema.edgeTypes.map(e => (
              <span key={e.type} style={{
                fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                background: e.color + '20', color: e.color, border: `1px solid ${e.color}40`,
                fontFamily: 'monospace',
              }}>{e.type}</span>
            ))}
          </div>
        </Card>

        {/* Obsidian Git State */}
        <Card delay={0.38}>
          <CardHeader icon="🌿" title="Obsidian Git State" sub={`Auto-commit every ${obsidianGit.autoCommitInterval / 60000}m · ${obsidianGit.syncMethod} sync · branch: ${obsidianGit.currentBranch}`} />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {[
              { label: 'Staged', value: obsidianGit.status.staged, color: '#10b981' },
              { label: 'Changed', value: obsidianGit.status.changed, color: '#f59e0b' },
              { label: 'Untracked', value: obsidianGit.status.untracked, color: '#94a3b8' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--neo-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '10px', fontFamily: 'monospace', fontSize: '10px' }}>
            <div style={{ color: '#22d3ee' }}>{obsidianGit.lastCommit.hash}</div>
            <div style={{ color: 'var(--neo-text)', marginTop: '2px' }}>{obsidianGit.lastCommit.message}</div>
            <div style={{ color: 'var(--neo-muted)', marginTop: '2px' }}>{obsidianGit.lastCommit.author} · {obsidianGit.lastCommit.ago}</div>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {obsidianGit.branches.map(b => (
              <span key={b} style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '5px', fontFamily: 'monospace',
                background: b === obsidianGit.currentBranch ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                color: b === obsidianGit.currentBranch ? '#a5b4fc' : 'var(--neo-muted)',
                border: `1px solid ${b === obsidianGit.currentBranch ? 'rgba(99,102,241,0.4)' : 'var(--neo-border)'}`,
              }}>{b}</span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
