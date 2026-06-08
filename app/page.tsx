'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph from './components/ForceGraph';
import MetricsPanel from './components/MetricsPanel';
import ImprovementChart from './components/ImprovementChart';
import ConnectionLog from './components/ConnectionLog';
import NodeDetailPanel from './components/NodeDetailPanel';
import PlatformMesh from './components/PlatformMesh';
import DataFlowTicker from './components/DataFlowTicker';
import { ThemeContext, THEMES, useTheme, type Theme } from './theme';

type Tab = 'topology' | 'platforms' | 'trajectory';

function StatusBadge({ label, status }: { label: string; status: string }) {
  const t = useTheme();
  const color = status === 'healthy' ? t.success : status === 'degraded' ? t.warning : t.error;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: status === 'healthy' ? 'pulse 2.5s infinite' : 'none' }} />
      <span style={{ color: t.textMuted }}>{label}</span>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  const t = useTheme();
  return (
    <button onClick={onClick} style={{ cursor: 'pointer', padding: '7px 14px', fontSize: '13px', borderRadius: '8px', color: active ? t.primary : t.textFaint, background: active ? t.primaryBg : 'transparent', border: `1px solid ${active ? t.primaryBorder : 'transparent'}`, transition: 'all 0.2s' } as React.CSSProperties}>
      {label}
    </button>
  );
}

function ThemePicker({ current, onChange }: { current: string; onChange: (id: string) => void }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: '8px', padding: '5px 12px', color: t.textMuted, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{THEMES[current].emoji}</span>
        <span>{THEMES[current].name}</span>
        <span style={{ fontSize: '9px', marginLeft: '2px' }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', bottom: '44px', right: 0, background: t.panel, border: `1px solid ${t.borderStrong}`, borderRadius: '10px', padding: '6px', zIndex: 200, minWidth: '160px', boxShadow: '0 -8px 24px #00000066', animation: 'slideIn 0.15s ease' }}>
          {Object.values(THEMES).map(theme => (
            <button key={theme.id} onClick={() => { onChange(theme.id); setOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '7px 10px', background: current === theme.id ? t.primaryBg : 'transparent', border: `1px solid ${current === theme.id ? t.primaryBorder : 'transparent'}`, borderRadius: '6px', cursor: 'pointer', marginBottom: '2px', color: current === theme.id ? t.primary : t.textMuted, fontSize: '12px', transition: 'all 0.15s' }}>
              <span>{theme.emoji}</span>
              <span>{theme.name}</span>
              {current === theme.id && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const t = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: t.textFaint, fontSize: '11px' }}>{label}</span>
      <span style={{ color: color || t.textMuted, fontFamily: 'monospace', fontSize: '10px' }}>{value}</span>
    </div>
  );
}

function DashboardInner() {
  const t = useTheme();
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [platforms, setPlatforms] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('topology');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  async function loadAll() {
    setRefreshing(true);
    try {
      const [h, m, g, p] = await Promise.all([
        fetch('/api/health').then(r => r.json()),
        fetch('/api/metrics').then(r => r.json()),
        fetch('/api/graph').then(r => r.json()),
        fetch('/api/platforms').then(r => r.json()),
      ]);
      setHealth(h); setMetrics(m); setGraph(g); setPlatforms(p);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  }

  useEffect(() => {
    loadAll();
    try {
      const es = new EventSource('/api/stream?projectId=agentic-os');
      esRef.current = es;
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type !== 'connected') {
            setLogs(prev => [{ id: crypto.randomUUID(), time: new Date().toLocaleTimeString(), type: data.type, source: data.siteName || data.source || 'system', message: data.eventType || data.query || data.message || 'update', status: data.graphifyStatus || data.status || 'success' }, ...prev].slice(0, 60));
          }
        } catch { /* ignore */ }
      };
      es.onerror = () => es.close();
    } catch { /* SSE not available */ }

    const interval = setInterval(async () => {
      const [h, m] = await Promise.all([fetch('/api/health').then(r => r.json()), fetch('/api/metrics').then(r => r.json())]);
      setHealth(h); setMetrics(m); setLastUpdated(new Date());
    }, 10000);

    return () => { esRef.current?.close(); clearInterval(interval); };
  }, []);

  const handleNodeClick = useCallback((node: any) => setSelectedNode(node), []);

  if (!health || !metrics || !graph) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: t.bg, color: t.primary, gap: '16px' }}>
        <div style={{ fontSize: '28px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙️</div>
        <div style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Initializing neural mesh...</div>
        <div style={{ fontSize: '11px', color: t.textFaint, letterSpacing: '1px' }}>Connecting to Graphify · MCP · FinSurfing</div>
      </div>
    );
  }

  return (
    <div style={{ background: t.bg, color: t.text, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${t.border}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: t.headerBg, backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: t.primary, letterSpacing: '-0.3px' }}>SurfingNeo-OS</h1>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: t.textFaint }}>Neural Mesh · FinSurfing · Prompt Engineering · Knowledge Graph</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <StatusBadge label="Graphify" status={health.systems.graphify.status} />
          <StatusBadge label="MCP" status={health.systems.mcp.status} />
          <StatusBadge label="SSE" status={health.systems.sse.status} />
          <div style={{ width: '1px', height: '20px', background: t.border }} />
          <button onClick={loadAll} disabled={refreshing} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: '6px', padding: '5px 12px', color: refreshing ? t.textFaint : t.textMuted, fontSize: '11px', cursor: refreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', display: 'inline-block' }}>↺</span> Refresh
          </button>
          {lastUpdated && <div style={{ fontSize: '10px', color: t.textFaint }}>{lastUpdated.toLocaleTimeString()}</div>}
        </div>
      </header>

      <main style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <TabButton active={tab === 'topology'} onClick={() => setTab('topology')} label="🔗 Connection Topology" />
              <TabButton active={tab === 'platforms'} onClick={() => setTab('platforms')} label="🌊 Platform Mesh" />
              <TabButton active={tab === 'trajectory'} onClick={() => setTab('trajectory')} label="📈 30-Day Trajectory" />
              {graph.warning && (
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: t.warning + '88', padding: '3px 8px', background: t.warning + '11', borderRadius: '8px', border: `1px solid ${t.warning}22` }}>
                  ⚠ {graph.warning.split('—')[0].trim()}
                </span>
              )}
            </div>

            {tab === 'topology' && (
              <>
                <ForceGraph data={graph} onNodeClick={handleNodeClick} />
                {selectedNode && (
                  <div style={{ marginTop: '16px' }}>
                    <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
                  </div>
                )}
              </>
            )}
            {tab === 'platforms' && platforms && <PlatformMesh data={platforms} />}
            {tab === 'trajectory' && (
              <>
                <ImprovementChart data={metrics.history} />
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'KB Nodes', value: metrics.knowledgeBase.totalNodes.toLocaleString(), color: t.secondary, trend: `+${metrics.knowledgeBase.growthRate}/day` },
                    { label: 'API Requests', value: metrics.apiBrain.totalRequests.toLocaleString(), color: t.accent, trend: `${metrics.apiBrain.avgLatencyMs}ms avg` },
                    { label: 'Insights', value: metrics.secondaryBrain.insightsGenerated.toLocaleString(), color: t.primary, trend: `${(metrics.secondaryBrain.accuracyScore * 100).toFixed(0)}% accuracy` },
                    { label: 'Brain Score', value: String(metrics.improvement.overall.score), color: t.success, trend: `▲ ${metrics.improvement.overall.trend}% this month` },
                  ].map(({ label, value, color, trend }) => (
                    <div key={label} style={{ padding: '12px', background: t.bgDeep, borderRadius: '8px', border: `1px solid ${t.border}` }}>
                      <div style={{ fontSize: '10px', color: t.textFaint, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: '10px', color: t.textFaint, marginTop: '4px' }}>{trend}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Data flow ticker */}
          <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '13px', color: t.primary, fontWeight: 600 }}>⚡ Live Data Flow</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: t.textFaint }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.success, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                streaming
              </div>
            </div>
            <div style={{ fontSize: '10px', color: t.textFaint, fontFamily: 'monospace', display: 'grid', gridTemplateColumns: '58px 90px 120px 1fr', gap: '6px', marginBottom: '8px', padding: '0 8px' }}>
              <span>TIME</span><span>PLATFORM</span><span>ACTION</span><span>DETAIL</span>
            </div>
            <DataFlowTicker liveEvents={logs} />
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '16px 20px' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '13px', color: t.primary, fontWeight: 600 }}>📊 Brain Health</h2>
            <MetricsPanel metrics={metrics} health={health} />
          </div>

          <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '13px', color: t.primary, fontWeight: 600 }}>📡 SSE Connection Log</h2>
              <span style={{ fontSize: '10px', color: t.textFaint }}>{logs.length} events</span>
            </div>
            <ConnectionLog logs={logs} />
          </div>

          {/* System status */}
          <div style={{ padding: '14px 16px', background: t.panel, border: `1px solid ${t.border}`, borderRadius: '12px' }}>
            <div style={{ fontSize: '10px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Row label="SSE clients" value={health.systems.sse.connections.totalClients} />
              <Row label="Graphify circuit" value={health.systems.graphify.circuitState.state} color={health.systems.graphify.circuitState.state === 'CLOSED' ? t.success : t.warning} />
              <Row label="MCP circuit" value={health.systems.mcp.circuitState.state} color={health.systems.mcp.circuitState.state === 'CLOSED' ? t.success : t.warning} />
              <Row label="Graph source" value={graph.source || 'unknown'} color={graph.source?.includes('live') ? t.success : t.warning} />
              <Row label="Metrics source" value={metrics.source || 'unknown'} color={metrics.source?.includes('live') ? t.success : t.warning} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  const [themeId, setThemeId] = useState('tan');
  const t = THEMES[themeId];

  return (
    <ThemeContext.Provider value={t}>
      {/* Floating theme picker */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 300 }}>
        <ThemePicker current={themeId} onChange={setThemeId} />
      </div>
      <DashboardInner />
    </ThemeContext.Provider>
  );
}
