'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { openbbProviders, graphifySchema, obsidianGit } from '@/lib/neo-mock';

type Category = 'all' | 'Market Data' | 'Economics' | 'Regulators' | 'Derivatives' | 'Screening' | 'News';
type Tier = 'all' | 'core' | 'optional';

const CATEGORY_COLORS: Record<string, string> = {
  'Market Data': '#6366f1', 'Economics': '#a78bfa', 'Regulators': '#f97316',
  'Derivatives': '#ef4444', 'Screening': '#22d3ee', 'News': '#f59e0b',
};

const TIER_ICONS: Record<string, string> = {
  core: '⚡', optional: '○',
};

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>{title}</h2>
        <p style={{ fontSize: '12px', color: 'var(--neo-muted)', marginTop: '3px' }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--neo-surface)', border: '1px solid var(--neo-border)',
      borderRadius: '10px', padding: '14px 16px',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--neo-muted)', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--neo-faint)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function GraphifySchemaView() {
  const s = graphifySchema;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Node types */}
      <div style={{ background: 'var(--neo-surface)', border: '1px solid var(--neo-border)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neo-text)', marginBottom: '12px' }}>Node Types</div>
        {s.nodeTypes.map(n => (
          <div key={n.type} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: n.color, flexShrink: 0, display: 'inline-block' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neo-text)' }}>{n.type}</div>
              <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>{n.description}</div>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--neo-faint)' }}>{n.count.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Edge types + stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: 'var(--neo-surface)', border: '1px solid var(--neo-border)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--neo-text)', marginBottom: '12px' }}>Edge Types</div>
          {s.edgeTypes.map(e => (
            <div key={e.type} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                background: e.color + '20', color: e.color, border: `1px solid ${e.color}40`,
                fontFamily: 'monospace',
              }}>{e.type}</span>
              <span style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>{e.description}</span>
            </div>
          ))}
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--neo-border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>
              Relations: {s.relations.map(r => (
                <code key={r} style={{ fontSize: '10px', color: 'var(--neo-faint)', marginLeft: '4px' }}>{r}</code>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <StatCard label="Total Nodes" value={s.stats.totalNodes.toLocaleString()} color="#6366f1" />
          <StatCard label="Total Edges" value={s.stats.totalEdges.toLocaleString()} color="#22d3ee" />
          <StatCard label="God Nodes" value={s.stats.godNodes} color="#f59e0b" sub="highly connected" />
          <StatCard label="Token Reduction" value={s.stats.tokenReduction} color="#10b981" sub="vs sequential read" />
        </div>
      </div>
    </div>
  );
}

function ObsidianGitView() {
  const g = obsidianGit;
  const actionColor = g.currentAction === 'idle' ? '#94a3b8' : '#10b981';
  return (
    <div style={{ background: 'var(--neo-surface)', border: '1px solid var(--neo-border)', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--neo-text)' }}>Obsidian Git — Vault Sync</div>
          <div style={{ fontSize: '11px', color: 'var(--neo-muted)', marginTop: '2px' }}>
            Auto-commit every {g.autoCommitInterval / 60000}m · sync method: <code style={{ color: 'var(--neo-faint)' }}>{g.syncMethod}</code>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.3)',
          }}>● {g.currentBranch}</span>
          <span style={{
            fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
            background: `${actionColor}18`, color: actionColor,
            border: `1px solid ${actionColor}40`,
          }}>{g.currentAction}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <StatCard label="Staged" value={g.status.staged} color="#10b981" />
        <StatCard label="Changed" value={g.status.changed} color="#f59e0b" />
        <StatCard label="Untracked" value={g.status.untracked} color="#94a3b8" />
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '11px' }}>
        <div style={{ color: 'var(--neo-faint)', marginBottom: '4px' }}>last commit</div>
        <div style={{ color: '#22d3ee' }}>{g.lastCommit.hash}</div>
        <div style={{ color: 'var(--neo-text)', marginTop: '2px' }}>{g.lastCommit.message}</div>
        <div style={{ color: 'var(--neo-muted)', marginTop: '2px' }}>{g.lastCommit.author} · {g.lastCommit.ago}</div>
      </div>

      <div style={{ marginTop: '14px' }}>
        <div style={{ fontSize: '11px', color: 'var(--neo-muted)', marginBottom: '6px' }}>Branches</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {g.branches.map(b => (
            <span key={b} style={{
              fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
              background: b === g.currentBranch ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              color: b === g.currentBranch ? '#a5b4fc' : 'var(--neo-muted)',
              border: `1px solid ${b === g.currentBranch ? 'rgba(99,102,241,0.4)' : 'var(--neo-border)'}`,
              fontFamily: 'monospace',
            }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DataPage() {
  const [category, setCategory] = useState<Category>('all');
  const [tier, setTier] = useState<Tier>('all');

  const categories: Category[] = ['all', 'Market Data', 'Economics', 'Regulators', 'Derivatives', 'Screening', 'News'];
  const tiers: Tier[] = ['all', 'core', 'optional'];

  const filtered = openbbProviders.filter(p =>
    (category === 'all' || p.category === category) &&
    (tier === 'all' || p.tier === tier)
  );

  const coreCount = openbbProviders.filter(p => p.tier === 'core').length;
  const optionalCount = openbbProviders.filter(p => p.tier === 'optional').length;

  return (
    <div className="neo-page-padding">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>Data Intelligence</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>
            OpenBB Platform · Graphify Knowledge Graph · Obsidian Git State
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(240,185,11,0.12)', color: '#f0b90b', border: '1px solid rgba(240,185,11,0.3)' }}>
            📊 OpenBB MCP v1.4.1
          </span>
          <span style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}>
            🕸️ Graphify 71.5× reduction
          </span>
        </div>
      </div>

      {/* OpenBB stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Total Providers" value={openbbProviders.length} color="#f0b90b" sub="core + optional" />
        <StatCard label="Core Providers" value={coreCount} color="#10b981" sub="always available" />
        <StatCard label="Optional Providers" value={optionalCount} color="#94a3b8" sub="key required" />
        <StatCard label="Asset Classes" value="11" color="#6366f1" sub="equity·crypto·macro·…" />
      </div>

      {/* OpenBB Provider Grid */}
      <Section title="OpenBB Data Providers" subtitle="Connect-once financial data hub — REST API on :6900 + MCP server">
        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{
                padding: '5px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 600,
                border: '1px solid', cursor: 'pointer',
                background: category === c ? 'rgba(99,102,241,0.15)' : 'transparent',
                borderColor: category === c ? 'rgba(99,102,241,0.5)' : 'var(--neo-border)',
                color: category === c ? '#a5b4fc' : 'var(--neo-muted)',
              }}>{c === 'all' ? 'All' : c}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {tiers.map(t => (
              <button key={t} onClick={() => setTier(t)} style={{
                padding: '5px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 600,
                border: '1px solid', cursor: 'pointer',
                background: tier === t ? 'rgba(16,185,129,0.15)' : 'transparent',
                borderColor: tier === t ? 'rgba(16,185,129,0.5)' : 'var(--neo-border)',
                color: tier === t ? '#10b981' : 'var(--neo-muted)',
              }}>{t === 'all' ? 'All Tiers' : `${TIER_ICONS[t]} ${t}`}</button>
            ))}
          </div>
        </div>

        <div className="neo-card-grid">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.03 }}
              style={{
                background: 'var(--neo-surface)', border: '1px solid var(--neo-border)',
                borderRadius: '10px', padding: '14px',
                opacity: p.tier === 'optional' ? 0.7 : 1,
              }}
              whileHover={{ borderColor: p.color, opacity: 1 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--neo-text)' }}>{p.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px',
                    background: (CATEGORY_COLORS[p.category] ?? '#6366f1') + '18',
                    color: CATEGORY_COLORS[p.category] ?? '#a5b4fc',
                  }}>{p.category}</span>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px',
                    background: p.tier === 'core' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                    color: p.tier === 'core' ? '#10b981' : '#94a3b8',
                  }}>{TIER_ICONS[p.tier]} {p.tier}</span>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--neo-muted)', margin: 0, lineHeight: 1.4 }}>{p.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Graphify Schema */}
      <Section title="Graphify Knowledge Graph" subtitle="safishamsi/graphify — AST parsing + Claude concept extraction + community detection">
        <GraphifySchemaView />
      </Section>

      {/* Obsidian Git */}
      <Section title="State Management" subtitle="Obsidian Git — vault version control, auto-commit, branch management">
        <ObsidianGitView />
      </Section>
    </div>
  );
}
