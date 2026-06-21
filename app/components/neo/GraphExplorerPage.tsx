'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, ChevronRight, Circle, ArrowRight } from 'lucide-react';
import { graph } from '@/lib/neo-mock';

type ExplorerTab = 'code-graph' | 'data-flow' | 'entity-graph' | 'signal-net' | 'node-list';

const TABS: { id: ExplorerTab; label: string; emoji: string; sub: string }[] = [
  { id: 'code-graph', label: 'Code Graph', emoji: '🔗', sub: 'Dependency network' },
  { id: 'data-flow', label: 'Data Flow', emoji: '⚡', sub: 'Real-time data pipeline — sources to UI' },
  { id: 'entity-graph', label: 'Entity Graph', emoji: '🌐', sub: 'Financial universe hierarchy — asset class → universe → symbol' },
  { id: 'signal-net', label: 'Signal Net', emoji: '📡', sub: 'Indicator network' },
  { id: 'node-list', label: 'Node List', emoji: '📋', sub: 'Filterable node registry' },
];

/* ─── Code Graph ─── */
const CODE_NODES = [
  { id: 'next-app', label: 'Next.js App', type: 'framework', x: 50, y: 50, deps: ['api-routes', 'components', 'lib'] },
  { id: 'api-routes', label: 'API Routes', type: 'api', x: 200, y: 30, deps: ['graphify-client', 'auth', 'circuit-breaker'] },
  { id: 'components', label: 'Components', type: 'ui', x: 200, y: 90, deps: ['hooks', 'lib'] },
  { id: 'lib', label: 'Lib / Utils', type: 'util', x: 360, y: 50, deps: ['circuit-breaker', 'auth'] },
  { id: 'hooks', label: 'React Hooks', type: 'ui', x: 360, y: 110, deps: ['graphify-client'] },
  { id: 'graphify-client', label: 'Graphify Client', type: 'client', x: 520, y: 30, deps: ['graphify-server'] },
  { id: 'circuit-breaker', label: 'Circuit Breaker', type: 'util', x: 520, y: 80, deps: [] },
  { id: 'auth', label: 'Auth / JWT', type: 'util', x: 520, y: 130, deps: [] },
  { id: 'graphify-server', label: 'Graphify Server', type: 'server', x: 680, y: 30, deps: [] },
];

const TYPE_COLORS: Record<string, string> = {
  framework: '#6366f1', api: '#22d3ee', ui: '#a78bfa',
  util: '#f59e0b', client: '#10b981', server: '#ef4444',
};

function CodeGraphTab() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [stats] = useState({ nodes: 9, edges: 13, providers: 4, tokenSavings: '42%' });

  const links = CODE_NODES.flatMap(n => n.deps.map(d => ({ from: n.id, to: d })));

  const getNode = (id: string) => CODE_NODES.find(n => n.id === id);

  return (
    <div>
      {/* Stats strip */}
      <div style={{ display: 'flex', gap: '1px', background: 'var(--neo-border)', borderBottom: '1px solid var(--neo-border)' }}>
        {[
          { label: 'NODES', value: stats.nodes },
          { label: 'EDGES', value: stats.edges },
          { label: 'PROVIDERS', value: stats.providers },
          { label: 'TOKEN SAVINGS', value: stats.tokenSavings },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, padding: '10px 16px', background: 'var(--neo-surface)', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--neo-faint)', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '2px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--neo-text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--neo-border)' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ fontSize: '10px', color: 'var(--neo-muted)', textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>

      {/* SVG graph */}
      <div style={{ overflowX: 'auto' }}>
        <svg ref={svgRef} width="760" height="200" style={{ display: 'block', padding: '16px' }}>
          {links.map((l, i) => {
            const from = getNode(l.from);
            const to = getNode(l.to);
            if (!from || !to) return null;
            const isHighlighted = hovered === l.from || hovered === l.to;
            return (
              <line key={i}
                x1={from.x + 50} y1={from.y + 14} x2={to.x + 50} y2={to.y + 14}
                stroke={isHighlighted ? 'var(--neo-primary)' : 'var(--neo-border)'}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeDasharray={isHighlighted ? '' : '4,3'}
                style={{ transition: 'all 0.2s' }}
              />
            );
          })}
          {CODE_NODES.map(n => {
            const color = TYPE_COLORS[n.type] ?? '#6366f1';
            const isHov = hovered === n.id;
            return (
              <g key={n.id} transform={`translate(${n.x},${n.y})`}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                <rect rx="8" width="100" height="28"
                  fill={isHov ? color + '22' : 'rgba(255,255,255,0.04)'}
                  stroke={isHov ? color : color + '55'}
                  strokeWidth={isHov ? 1.5 : 1}
                  style={{ transition: 'all 0.2s' }}
                />
                <circle cx="12" cy="14" r="4" fill={color} />
                <text x="20" y="18" fontSize="10" fill={isHov ? 'var(--neo-text)' : 'var(--neo-muted)'} fontFamily="monospace"
                  style={{ transition: 'fill 0.2s' }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ─── Data Flow ─── */
const PIPELINE_STAGES = [
  {
    id: 'sources', label: 'Sources', color: '#22d3ee',
    items: ['Graphify Server', 'MCP Invocations', 'Webhooks', 'SSE Stream'],
  },
  {
    id: 'processors', label: 'Processors', color: '#6366f1',
    items: ['Circuit Breaker', 'Auth Middleware', 'Data Transform', 'Cache Layer'],
  },
  {
    id: 'outputs', label: 'Outputs', color: '#10b981',
    items: ['ForceGraph UI', 'StatsBar KPIs', 'EventStream', 'BrainHealth'],
  },
];

function DataFlowTab() {
  const [tick, setTick] = useState(0);
  const [particles, setParticles] = useState<{ id: number; stage: number; pct: number; color: string }[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      setParticles(prev => {
        const moved = prev.map(p => ({ ...p, pct: p.pct + 8 })).filter(p => p.pct < 100);
        if (Math.random() > 0.4) {
          const stage = Math.floor(Math.random() * 2);
          const colors = ['#22d3ee', '#6366f1', '#10b981', '#f59e0b', '#a78bfa'];
          moved.push({ id: Date.now() + Math.random(), stage, pct: 0, color: colors[Math.floor(Math.random() * colors.length)] });
        }
        return moved;
      });
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: '0', position: 'relative' }}>
        {PIPELINE_STAGES.map((stage, si) => (
          <div key={stage.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Stage header */}
            <div style={{
              padding: '6px 16px', borderRadius: '20px', marginBottom: '16px',
              background: stage.color + '18', border: `1px solid ${stage.color}44`,
              fontSize: '11px', fontWeight: 700, color: stage.color, letterSpacing: '0.08em',
            }}>{stage.label}</div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', padding: '0 8px' }}>
              {stage.items.map(item => (
                <div key={item} style={{
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${stage.color}33`,
                  fontSize: '11px', color: 'var(--neo-muted)', textAlign: 'center',
                }}>
                  {item}
                </div>
              ))}
            </div>

            {/* Arrow between stages */}
            {si < PIPELINE_STAGES.length - 1 && (
              <div style={{ position: 'absolute', left: `${(si + 1) * (100 / PIPELINE_STAGES.length)}%`, top: '45%', transform: 'translateX(-50%)' }}>
                <ArrowRight style={{ color: 'var(--neo-faint)', width: 20, height: 20 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Live throughput */}
      <div style={{ marginTop: '24px', padding: '14px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--neo-border)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Throughput', value: `${120 + (tick % 40)}`, unit: 'msg/s', color: '#22d3ee' },
          { label: 'Latency P99', value: `${42 + (tick % 18)}`, unit: 'ms', color: '#6366f1' },
          { label: 'Error Rate', value: '0.02', unit: '%', color: '#10b981' },
          { label: 'Queue Depth', value: `${tick % 12}`, unit: 'pending', color: '#f59e0b' },
        ].map(m => (
          <div key={m.label}>
            <div style={{ fontSize: '9px', color: 'var(--neo-faint)', letterSpacing: '0.1em', fontWeight: 700 }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>
              {m.value}<span style={{ fontSize: '11px', color: 'var(--neo-muted)', marginLeft: '3px' }}>{m.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Entity Graph ─── */
const ENTITY_TREE = [
  {
    id: 'equities', label: 'Equities', icon: '📈', expanded: true,
    children: [
      {
        id: 'us-large-cap', label: 'US Large Cap', icon: '🏢',
        children: [
          { id: 'AAPL', label: 'AAPL · Apple Inc.', icon: '🍎', value: '$189.42', change: '+1.2%', up: true },
          { id: 'MSFT', label: 'MSFT · Microsoft', icon: '🪟', value: '$415.23', change: '+0.8%', up: true },
          { id: 'NVDA', label: 'NVDA · NVIDIA', icon: '⚡', value: '$875.11', change: '-0.4%', up: false },
        ],
      },
      {
        id: 'us-small-cap', label: 'US Small Cap', icon: '🏭',
        children: [
          { id: 'PLTR', label: 'PLTR · Palantir', icon: '🔮', value: '$22.18', change: '+3.1%', up: true },
        ],
      },
    ],
  },
  {
    id: 'crypto', label: 'Crypto', icon: '₿', expanded: false,
    children: [
      {
        id: 'bitcoin', label: 'Bitcoin', icon: '🪙',
        children: [
          { id: 'BTC', label: 'BTC · Bitcoin', icon: '₿', value: '$68,420', change: '+2.4%', up: true },
        ],
      },
    ],
  },
  {
    id: 'macro', label: 'Macro', icon: '🌐', expanded: false,
    children: [
      {
        id: 'rates', label: 'Interest Rates', icon: '📊',
        children: [
          { id: 'FED', label: 'Fed Funds Rate', icon: '🏛️', value: '5.25%', change: '0.00%', up: false },
        ],
      },
    ],
  },
];

type EntityNode = {
  id: string; label: string; icon: string; expanded?: boolean;
  children?: EntityNode[];
  value?: string; change?: string; up?: boolean;
};

function EntityRow({ node, depth = 0 }: { node: EntityNode; depth?: number }) {
  const [open, setOpen] = useState(node.expanded ?? false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        onClick={() => hasChildren && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: `6px 12px 6px ${12 + depth * 20}px`,
          cursor: hasChildren ? 'pointer' : 'default',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
          background: depth === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
        }}
        onMouseEnter={e => { if (depth > 0) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = depth === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'; }}
      >
        {hasChildren && (
          <span style={{ color: 'var(--neo-faint)', width: 12, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </span>
        )}
        {!hasChildren && <span style={{ width: 12, flexShrink: 0 }} />}
        <span style={{ fontSize: depth === 2 ? '13px' : '11px' }}>{node.icon}</span>
        <span style={{
          fontSize: '12px', fontWeight: depth === 0 ? 700 : depth === 1 ? 600 : 400,
          color: depth === 0 ? 'var(--neo-text)' : depth === 1 ? 'var(--neo-muted)' : 'var(--neo-text)',
          flex: 1,
        }}>{node.label}</span>
        {node.value && (
          <>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--neo-text)' }}>{node.value}</span>
            <span style={{
              fontSize: '10px', fontFamily: 'monospace', marginLeft: '8px', minWidth: '50px', textAlign: 'right',
              color: node.up ? '#10b981' : '#ef4444',
            }}>{node.change}</span>
          </>
        )}
      </div>
      <AnimatePresence>
        {open && hasChildren && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
            {node.children!.map(child => <EntityRow key={child.id} node={child} depth={depth + 1} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EntityGraphTab() {
  return (
    <div>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--neo-border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '260px' }}>
          <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: 'var(--neo-faint)' }} />
          <input placeholder="Search symbols..." style={{
            width: '100%', padding: '6px 8px 6px 26px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)',
            fontSize: '11px', color: 'var(--neo-text)', outline: 'none',
          }} />
        </div>
        <span style={{ fontSize: '10px', color: 'var(--neo-faint)' }}>3 asset classes · 6 symbols</span>
      </div>
      <div style={{ fontFamily: 'monospace' }}>
        {ENTITY_TREE.map(node => <EntityRow key={node.id} node={node} depth={0} />)}
      </div>
    </div>
  );
}

/* ─── Signal Net ─── */
const SIGNALS = [
  { id: 'rsi', label: 'RSI (14)', category: 'technical', value: 68.4, threshold: 70, status: 'warning', assets: ['AAPL', 'MSFT', 'NVDA'] },
  { id: 'macd', label: 'MACD Cross', category: 'technical', value: 1, threshold: 0, status: 'bullish', assets: ['AAPL', 'PLTR'] },
  { id: 'sma200', label: 'Above SMA200', category: 'technical', value: 1, threshold: 0, status: 'bullish', assets: ['AAPL', 'MSFT'] },
  { id: 'wsb-sentiment', label: 'WSB Sentiment', category: 'sentiment', value: 72, threshold: 60, status: 'bullish', assets: ['NVDA', 'PLTR'] },
  { id: 'news-flow', label: 'News Flow', category: 'sentiment', value: 0.61, threshold: 0.5, status: 'neutral', assets: ['MSFT'] },
  { id: 'fed-rate', label: 'Fed Rate Regime', category: 'macro', value: 5.25, threshold: 4.0, status: 'bearish', assets: ['All Equities'] },
  { id: 'vix', label: 'VIX Regime', category: 'macro', value: 18.2, threshold: 20, status: 'bullish', assets: ['All Equities'] },
  { id: 'insider', label: 'Insider Buying', category: 'alt-data', value: 3, threshold: 0, status: 'bullish', assets: ['AAPL', 'MSFT'] },
  { id: 'short-int', label: 'Short Interest Spike', category: 'alt-data', value: 8.2, threshold: 10, status: 'neutral', assets: ['NVDA'] },
];

const SIGNAL_STATUS_COLOR: Record<string, string> = {
  bullish: '#10b981', bearish: '#ef4444', warning: '#f59e0b', neutral: '#94a3b8',
};

const CAT_COLORS: Record<string, string> = {
  technical: '#6366f1', sentiment: '#f59e0b', macro: '#22d3ee', 'alt-data': '#10b981',
};

function SignalNetTab() {
  const [filter, setFilter] = useState<string | null>(null);
  const cats = ['technical', 'sentiment', 'macro', 'alt-data'];
  const filtered = filter ? SIGNALS.filter(s => s.category === filter) : SIGNALS;

  return (
    <div>
      {/* Filter pills */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid var(--neo-border)' }}>
        <button onClick={() => setFilter(null)} style={{
          padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
          background: !filter ? 'rgba(99,102,241,0.15)' : 'transparent',
          border: `1px solid ${!filter ? 'rgba(99,102,241,0.4)' : 'var(--neo-border)'}`,
          color: !filter ? 'var(--neo-primary)' : 'var(--neo-faint)',
        }}>ALL</button>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c === filter ? null : c)} style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
            background: filter === c ? CAT_COLORS[c] + '18' : 'transparent',
            border: `1px solid ${filter === c ? CAT_COLORS[c] + '55' : 'var(--neo-border)'}`,
            color: filter === c ? CAT_COLORS[c] : 'var(--neo-faint)',
            textTransform: 'capitalize',
          }}>{c}</button>
        ))}
      </div>

      {/* Signal grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', padding: '16px' }}>
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            style={{
              padding: '12px 14px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.02)', border: `1px solid ${SIGNAL_STATUS_COLOR[s.status]}33`,
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--neo-text)' }}>{s.label}</div>
                <div style={{ fontSize: '9px', color: CAT_COLORS[s.category] ?? 'var(--neo-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>{s.category}</div>
              </div>
              <span style={{
                fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px',
                background: SIGNAL_STATUS_COLOR[s.status] + '18',
                color: SIGNAL_STATUS_COLOR[s.status],
                border: `1px solid ${SIGNAL_STATUS_COLOR[s.status]}44`,
                textTransform: 'uppercase',
              }}>{s.status}</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'monospace', color: SIGNAL_STATUS_COLOR[s.status], marginBottom: '6px' }}>
              {typeof s.value === 'number' && s.value < 10 ? s.value.toFixed(2) : s.value}
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {s.assets.slice(0, 3).map(a => (
                <span key={a} style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--neo-muted)', fontFamily: 'monospace' }}>{a}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Node List ─── */
function NodeListTab() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'label' | 'size' | 'capacity'>('size');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const types = Array.from(new Set(graph.nodes.map(n => n.type)));
  const STATUS_COLOR: Record<string, string> = { healthy: '#10b981', degraded: '#f59e0b', offline: '#ef4444' };
  const NODE_TYPE_COLOR: Record<string, string> = { core: '#6366f1', brain: '#a78bfa', platform: '#22d3ee', site: '#10b981', memory: '#f59e0b' };

  const filtered = graph.nodes
    .filter(n => (!search || n.label.toLowerCase().includes(search.toLowerCase())) && (!typeFilter || n.type === typeFilter))
    .sort((a, b) => {
      if (sort === 'label') return a.label.localeCompare(b.label);
      if (sort === 'size') return b.size - a.size;
      return b.capacity - a.capacity;
    });

  return (
    <div>
      {/* Controls */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid var(--neo-border)', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: 'var(--neo-faint)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search nodes..."
            style={{ padding: '6px 8px 6px 26px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)', fontSize: '11px', color: 'var(--neo-text)', outline: 'none', width: '160px' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)} style={{
              padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600, cursor: 'pointer',
              background: typeFilter === t ? (NODE_TYPE_COLOR[t] ?? '#6366f1') + '18' : 'transparent',
              border: `1px solid ${typeFilter === t ? (NODE_TYPE_COLOR[t] ?? '#6366f1') + '55' : 'var(--neo-border)'}`,
              color: typeFilter === t ? (NODE_TYPE_COLOR[t] ?? '#6366f1') : 'var(--neo-faint)',
              textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
          {(['label', 'size', 'capacity'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)} style={{
              padding: '4px 8px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer',
              background: sort === s ? 'rgba(99,102,241,0.12)' : 'transparent',
              border: `1px solid ${sort === s ? 'rgba(99,102,241,0.4)' : 'var(--neo-border)'}`,
              color: sort === s ? 'var(--neo-primary)' : 'var(--neo-faint)',
              textTransform: 'capitalize',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 60px', gap: '8px', padding: '6px 16px', borderBottom: '1px solid var(--neo-border)' }}>
        {['Node', 'Type', 'Size', 'Capacity', 'Status'].map(h => (
          <div key={h} style={{ fontSize: '9px', color: 'var(--neo-faint)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <AnimatePresence>
        {filtered.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 60px', gap: '8px', padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Circle style={{ width: 8, height: 8, color: NODE_TYPE_COLOR[n.type] ?? '#6366f1', fill: NODE_TYPE_COLOR[n.type] ?? '#6366f1', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neo-text)' }}>{n.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--neo-faint)', fontFamily: 'monospace' }}>{n.id}</div>
              </div>
            </div>
            <span style={{
              fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', display: 'inline-block',
              background: (NODE_TYPE_COLOR[n.type] ?? '#6366f1') + '18',
              color: NODE_TYPE_COLOR[n.type] ?? '#6366f1',
              textTransform: 'capitalize',
            }}>{n.type}</span>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--neo-text)' }}>{n.size.toLocaleString()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ flex: 1, height: '3px', borderRadius: '3px', background: 'var(--neo-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '3px', width: `${n.capacity}%`, background: n.capacity > 80 ? '#ef4444' : n.capacity > 60 ? '#f59e0b' : '#10b981' }} />
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--neo-muted)', flexShrink: 0 }}>{n.capacity}%</span>
            </div>
            <span style={{
              fontSize: '9px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', display: 'inline-block',
              background: STATUS_COLOR[n.status] + '18', color: STATUS_COLOR[n.status],
              textTransform: 'capitalize',
            }}>{n.status}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main export ─── */
export function GraphExplorerPage() {
  const [tab, setTab] = useState<ExplorerTab>('code-graph');

  return (
    <div className="neo-page-padding">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>Graph Explorer</h1>
        <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>
          {TABS.find(t => t.id === tab)?.sub ?? ''}
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '2px', borderBottom: '1px solid var(--neo-border)',
        marginBottom: '0', overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '8px 14px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px',
              color: tab === t.id ? 'var(--neo-text)' : 'var(--neo-muted)',
              borderBottom: tab === t.id ? '2px solid var(--neo-primary)' : '2px solid transparent',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
            <span>{t.emoji}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: 'var(--neo-surface)', border: '1px solid var(--neo-border)', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {tab === 'code-graph' && <CodeGraphTab />}
            {tab === 'data-flow' && <DataFlowTab />}
            {tab === 'entity-graph' && <EntityGraphTab />}
            {tab === 'signal-net' && <SignalNetTab />}
            {tab === 'node-list' && <NodeListTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
