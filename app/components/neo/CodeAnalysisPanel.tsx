'use client';
import { useState, useCallback } from 'react';
import { Panel } from './Panel';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GitMerge, GitBranch, AlertCircle, Layers, BarChart2, Network, RefreshCw, ChevronRight, ChevronDown } from 'lucide-react';

type QueryType =
  | 'find_callers'
  | 'find_callees'
  | 'find_all_callers'
  | 'find_all_callees'
  | 'dead_code'
  | 'module_deps'
  | 'find_complexity'
  | 'class_hierarchy'
  | 'bfs'
  | 'dfs';

interface QueryDef {
  id: QueryType;
  label: string;
  description: string;
  iconKey: 'merge' | 'branch' | 'alert' | 'layers' | 'bar' | 'network';
  needsNodeId: boolean;
  needsStart: boolean;
  category: 'relationship' | 'traversal' | 'analysis';
}

function QueryIcon({ k }: { k: QueryDef['iconKey'] }) {
  if (k === 'merge') return <GitMerge className="w-3.5 h-3.5" />;
  if (k === 'branch') return <GitBranch className="w-3.5 h-3.5" />;
  if (k === 'alert') return <AlertCircle className="w-3.5 h-3.5" />;
  if (k === 'layers') return <Layers className="w-3.5 h-3.5" />;
  if (k === 'bar') return <BarChart2 className="w-3.5 h-3.5" />;
  return <Network className="w-3.5 h-3.5" />;
}

const QUERIES: QueryDef[] = [
  { id: 'find_callers', label: 'Find Callers', description: 'Nodes that depend on the selected node', iconKey: 'merge', needsNodeId: true, needsStart: false, category: 'relationship' },
  { id: 'find_callees', label: 'Find Callees', description: 'Nodes that the selected node depends on', iconKey: 'branch', needsNodeId: true, needsStart: false, category: 'relationship' },
  { id: 'find_all_callers', label: 'All Callers (transitive)', description: 'Full upstream dependency chain', iconKey: 'merge', needsNodeId: true, needsStart: false, category: 'relationship' },
  { id: 'find_all_callees', label: 'All Callees (transitive)', description: 'Full downstream dependency chain', iconKey: 'branch', needsNodeId: true, needsStart: false, category: 'relationship' },
  { id: 'dead_code', label: 'Dead Nodes', description: 'Unreferenced nodes with no incoming links', iconKey: 'alert', needsNodeId: false, needsStart: false, category: 'analysis' },
  { id: 'module_deps', label: 'Module Dependencies', description: 'Fan-in / fan-out summary by node type', iconKey: 'layers', needsNodeId: false, needsStart: false, category: 'analysis' },
  { id: 'find_complexity', label: 'Complexity Ranking', description: 'Nodes ranked by connection complexity', iconKey: 'bar', needsNodeId: false, needsStart: false, category: 'analysis' },
  { id: 'class_hierarchy', label: 'Node Hierarchy', description: 'Hierarchical relationships in the graph', iconKey: 'layers', needsNodeId: false, needsStart: false, category: 'analysis' },
  { id: 'bfs', label: 'BFS Traversal', description: 'Breadth-first traversal from a start node', iconKey: 'network', needsNodeId: false, needsStart: true, category: 'traversal' },
  { id: 'dfs', label: 'DFS Traversal', description: 'Depth-first traversal from a start node', iconKey: 'network', needsNodeId: false, needsStart: true, category: 'traversal' },
];

const KNOWN_NODES = [
  { id: 'kb-core', label: 'Knowledge Base Core' },
  { id: 'api-brain', label: 'API Brain' },
  { id: 'secondary-brain', label: 'Secondary Brain' },
  { id: 'graphify', label: 'Graphify Engine' },
  { id: 'mcp-claude', label: 'Claude MCP' },
  { id: 'vercel-api', label: 'Vercel API Layer' },
  { id: 'site-1', label: 'Production Website' },
  { id: 'site-2', label: 'Staging Website' },
  { id: 'memory-space', label: 'Memory Space' },
  { id: 'skill-registry', label: 'SKILL.md Registry' },
];

const CATEGORY_LABELS: Record<string, string> = {
  relationship: 'Relationship Queries',
  traversal: 'Graph Traversal',
  analysis: 'Analysis',
};

const CATEGORY_ORDER = ['relationship', 'traversal', 'analysis'];

function CategoryBadge({ cat }: { cat: string }) {
  const colors: Record<string, string> = {
    relationship: 'rgba(99,102,241,0.15)',
    traversal: 'rgba(16,185,129,0.15)',
    analysis: 'rgba(245,158,11,0.15)',
  };
  const textColors: Record<string, string> = {
    relationship: '#a5b4fc',
    traversal: '#6ee7b7',
    analysis: '#fcd34d',
  };
  return (
    <span style={{
      fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px',
      background: colors[cat] ?? 'rgba(255,255,255,0.08)',
      color: textColors[cat] ?? 'var(--neo-muted)',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>{cat}</span>
  );
}

function ResultRow({ item, index }: { item: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const nodeData = item.node ?? item.parent ?? item;
  const label = nodeData?.label ?? item.module ?? `Result ${index + 1}`;
  const type = nodeData?.type ?? '';
  const relationship = item.relationship ?? '';

  const hasDetails = item.node || item.parent || item.child || item.link || item.outDegree !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      style={{ borderBottom: '1px solid var(--neo-border)', padding: '8px 0' }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: hasDetails ? 'pointer' : 'default' }}
        onClick={() => hasDetails && setExpanded(e => !e)}
      >
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
          background: nodeData?.status === 'active' ? '#10b981' : nodeData?.status === 'warning' ? '#f59e0b' : 'var(--neo-muted)',
        }} />
        <span style={{ flex: 1, fontSize: '12px', color: 'var(--neo-text)', fontWeight: 500 }}>{label}</span>
        {type && <span style={{ fontSize: '10px', color: 'var(--neo-faint)', fontFamily: 'monospace' }}>{type}</span>}
        {relationship && (
          <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>
            {relationship}
          </span>
        )}
        {item.complexityScore !== undefined && (
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--neo-muted)' }}>
            score: {Math.round(item.complexityScore)}
          </span>
        )}
        {item.fanOut !== undefined && (
          <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--neo-muted)' }}>
            ↓{item.fanIn} ↑{item.fanOut}
          </span>
        )}
        {hasDetails && (
          expanded ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--neo-faint)', flexShrink: 0 }} />
                   : <ChevronRight className="w-3 h-3" style={{ color: 'var(--neo-faint)', flexShrink: 0 }} />
        )}
      </div>
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', paddingLeft: '14px', marginTop: '6px' }}
          >
            <pre style={{
              fontSize: '10px', color: 'var(--neo-muted)', fontFamily: 'monospace',
              whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              background: 'rgba(255,255,255,0.03)', borderRadius: '6px',
              padding: '8px', border: '1px solid var(--neo-border)', margin: 0,
            }}>
              {JSON.stringify(item, null, 2).slice(0, 600)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CodeAnalysisPanel() {
  const [selectedQuery, setSelectedQuery] = useState<QueryType>('find_callers');
  const [nodeId, setNodeId] = useState('kb-core');
  const [startNode, setStartNode] = useState('kb-core');
  const [maxDepth, setMaxDepth] = useState(3);
  const [direction, setDirection] = useState<'both' | 'outgoing' | 'incoming'>('both');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryDef = QUERIES.find(q => q.id === selectedQuery)!;

  const runQuery = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const body: Record<string, any> = { query_type: selectedQuery };
      if (queryDef.needsNodeId) body.node_id = nodeId;
      if (queryDef.needsStart) { body.start = startNode; body.maxDepth = maxDepth; body.direction = direction; }

      const res = await fetch('/api/code-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setError(e.message ?? 'Query failed');
    } finally {
      setLoading(false);
    }
  }, [selectedQuery, nodeId, startNode, maxDepth, direction, queryDef]);

  const categorized = CATEGORY_ORDER.map(cat => ({
    cat,
    queries: QUERIES.filter(q => q.category === cat),
  }));

  return (
    <div className="neo-page-padding">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>Code Graph Analysis</h1>
        <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>
          BFS/DFS traversal · relationship queries · complexity ranking — powered by Graphify
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', alignItems: 'start' }}>
        {/* Left: query selector */}
        <Panel>
          <div style={{ padding: '4px 0' }}>
            {categorized.map(({ cat, queries }) => (
              <div key={cat} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--neo-faint)', padding: '0 4px 6px', textTransform: 'uppercase' }}>
                  {CATEGORY_LABELS[cat]}
                </div>
                {queries.map(q => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuery(q.id)}
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: '8px',
                      padding: '7px 8px', borderRadius: '7px', border: 'none', cursor: 'pointer', marginBottom: '1px',
                      background: selectedQuery === q.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                      borderLeft: selectedQuery === q.id ? '2px solid var(--neo-primary)' : '2px solid transparent',
                    }}
                  >
                    <span style={{ color: selectedQuery === q.id ? 'var(--neo-primary)' : 'var(--neo-faint)', marginTop: '1px', flexShrink: 0 }}><QueryIcon k={q.iconKey} /></span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: selectedQuery === q.id ? 600 : 400, color: selectedQuery === q.id ? 'var(--neo-text)' : 'var(--neo-muted)' }}>{q.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--neo-faint)', marginTop: '1px', lineHeight: 1.3 }}>{q.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Panel>

        {/* Right: config + results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Panel title="Query Configuration" icon={<Search className="w-3 h-3" />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <CategoryBadge cat={queryDef.category} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--neo-text)' }}>{queryDef.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>— {queryDef.description}</span>
              </div>

              {queryDef.needsNodeId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--neo-muted)', minWidth: '70px' }}>Target Node</label>
                  <select
                    value={nodeId}
                    onChange={e => setNodeId(e.target.value)}
                    style={{
                      flex: 1, padding: '6px 10px', borderRadius: '7px', fontSize: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)',
                      color: 'var(--neo-text)', outline: 'none',
                    }}
                  >
                    {KNOWN_NODES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                  </select>
                </div>
              )}

              {queryDef.needsStart && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--neo-muted)', minWidth: '70px' }}>Start Node</label>
                    <select
                      value={startNode}
                      onChange={e => setStartNode(e.target.value)}
                      style={{
                        flex: 1, padding: '6px 10px', borderRadius: '7px', fontSize: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)',
                        color: 'var(--neo-text)', outline: 'none',
                      }}
                    >
                      {KNOWN_NODES.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--neo-muted)', minWidth: '70px' }}>Max Depth</label>
                    <input
                      type="number" min={1} max={6} value={maxDepth}
                      onChange={e => setMaxDepth(parseInt(e.target.value))}
                      style={{
                        width: '60px', padding: '6px 10px', borderRadius: '7px', fontSize: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)',
                        color: 'var(--neo-text)', outline: 'none',
                      }}
                    />
                    <label style={{ fontSize: '11px', color: 'var(--neo-muted)', marginLeft: '12px' }}>Direction</label>
                    <select
                      value={direction}
                      onChange={e => setDirection(e.target.value as any)}
                      style={{
                        padding: '6px 10px', borderRadius: '7px', fontSize: '12px',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)',
                        color: 'var(--neo-text)', outline: 'none',
                      }}
                    >
                      <option value="both">Both</option>
                      <option value="outgoing">Outgoing</option>
                      <option value="incoming">Incoming</option>
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={runQuery}
                disabled={loading}
                style={{
                  alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: loading ? 'default' : 'pointer',
                  background: 'linear-gradient(135deg, var(--neo-primary), var(--neo-secondary))',
                  color: '#fff', fontSize: '12px', fontWeight: 600,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Running…' : 'Run Query'}
              </button>
            </div>
          </Panel>

          {error && (
            <Panel>
              <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                <AlertCircle className="w-4 h-4" />
                <span style={{ fontSize: '12px' }}>{error}</span>
              </div>
            </Panel>
          )}

          {results && (
            <Panel
              title={results.description ?? queryDef.label}
              action={
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--neo-muted)' }}>
                  {results.total ?? results.results?.length ?? results.nodes?.length ?? 0} results
                  {results.fallback && ' · fallback'}
                </span>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={JSON.stringify({ selectedQuery, nodeId, startNode })}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Traversal result — show node list with depth */}
                  {(selectedQuery === 'bfs' || selectedQuery === 'dfs') && results.nodes && (
                    <div>
                      <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '11px', color: 'var(--neo-muted)' }}>
                        <span>Nodes visited: <strong style={{ color: 'var(--neo-text)' }}>{results.meta?.nodesVisited ?? results.nodes.length}</strong></span>
                        <span>Links traversed: <strong style={{ color: 'var(--neo-text)' }}>{results.meta?.linksTraversed ?? results.links?.length ?? 0}</strong></span>
                      </div>
                      {results.nodes.map((n: any, i: number) => (
                        <ResultRow key={n.id} item={{ node: n, relationship: `depth ${n.traversalDepth}` }} index={i} />
                      ))}
                    </div>
                  )}

                  {/* Relationship / analysis result */}
                  {selectedQuery !== 'bfs' && selectedQuery !== 'dfs' && results.results && (
                    results.results.length === 0
                      ? <div style={{ padding: '12px 0', fontSize: '12px', color: 'var(--neo-muted)' }}>No results found.</div>
                      : results.results.map((item: any, i: number) => <ResultRow key={i} item={item} index={i} />)
                  )}
                </motion.div>
              </AnimatePresence>
            </Panel>
          )}

          {!results && !loading && !error && (
            <Panel>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <Network className="w-8 h-8" style={{ color: 'var(--neo-faint)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '12px', color: 'var(--neo-muted)', margin: 0 }}>
                  Select a query type and click <strong>Run Query</strong> to analyse the knowledge graph.
                </p>
                <p style={{ fontSize: '11px', color: 'var(--neo-faint)', marginTop: '6px' }}>
                  BFS / DFS traversal · caller / callee analysis · dead node detection · complexity ranking
                </p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
