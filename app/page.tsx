'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ForceGraph from './components/ForceGraph';
import MetricsPanel from './components/MetricsPanel';
import ImprovementChart from './components/ImprovementChart';
import ConnectionLog from './components/ConnectionLog';
import NodeDetailPanel from './components/NodeDetailPanel';
import PlatformMesh from './components/PlatformMesh';
import DataFlowTicker from './components/DataFlowTicker';

type Tab = 'topology' | 'platforms' | 'trajectory';

const STATUS_COLORS: Record<string, string> = {
  healthy: '#00ff88', degraded: '#ffaa00', warning: '#ff6600', error: '#ff0044',
};

function StatusBadge({ label, status }: { label: string; status: string }) {
  const color = STATUS_COLORS[status] || '#444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, animation: status === 'healthy' ? 'pulse 2.5s infinite' : 'none' }} />
      <span style={{ color: '#555' }}>{label}</span>
    </div>
  );
}

function TabButton({ tab, active, onClick, label }: { tab: Tab; active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '8px 16px', fontSize: '13px', borderRadius: '8px',
        color: active ? '#00ff88' : '#444',
        background: active ? '#00ff8812' : 'transparent',
        border: `1px solid ${active ? '#00ff8833' : 'transparent'}`,
        transition: 'all 0.2s',
      } as React.CSSProperties}
    >{label}</button>
  );
}

export default function Dashboard() {
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
      setHealth(h);
      setMetrics(m);
      setGraph(g);
      setPlatforms(p);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Load error', e);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAll();

    // SSE for real-time connection log
    const es = new EventSource('/api/stream?projectId=agentic-os');
    esRef.current = es;
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type !== 'connected') {
        setLogs(prev => [{
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          type: data.type,
          source: data.siteName || data.source || 'system',
          message: data.eventType || data.query || data.message || 'update',
          status: data.graphifyStatus || data.status || 'success',
        }, ...prev].slice(0, 60));
      }
    };

    // Poll health + metrics every 10s
    const interval = setInterval(async () => {
      const [h, m] = await Promise.all([
        fetch('/api/health').then(r => r.json()),
        fetch('/api/metrics').then(r => r.json()),
      ]);
      setHealth(h);
      setMetrics(m);
      setLastUpdated(new Date());
    }, 10000);

    return () => { es.close(); clearInterval(interval); };
  }, []);

  const handleNodeClick = useCallback((node: any) => setSelectedNode(node), []);

  if (!health || !metrics || !graph) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#070710', color: '#00ff88', gap: '16px' }}>
        <div style={{ fontSize: '28px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙️</div>
        <div style={{ fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>Initializing neural mesh...</div>
        <div style={{ fontSize: '11px', color: '#222', letterSpacing: '1px' }}>Connecting to Graphify · MCP · FinSurfing</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#070710', color: '#e0e0e0', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #111', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: '#07071099', backdropFilter: 'blur(8px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#00ff88', letterSpacing: '-0.3px' }}>
              SurfingNeo-OS
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#333' }}>
              Neural Mesh · FinSurfing · Prompt Engineering · Knowledge Graph
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <StatusBadge label="Graphify" status={health.systems.graphify.status} />
          <StatusBadge label="MCP" status={health.systems.mcp.status} />
          <StatusBadge label="SSE" status={health.systems.sse.status} />
          <div style={{ width: '1px', height: '20px', background: '#111' }} />
          <button
            onClick={loadAll}
            disabled={refreshing}
            style={{ background: 'none', border: '1px solid #1a1a2e', borderRadius: '6px', padding: '5px 12px', color: refreshing ? '#222' : '#555', fontSize: '11px', cursor: refreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', display: 'inline-block' }}>↺</span>
            Refresh
          </button>
          {lastUpdated && (
            <div style={{ fontSize: '10px', color: '#222' }}>
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </header>

      <main style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tabs */}
          <div style={{ background: '#0d0d18', border: '1px solid #111', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', alignItems: 'center' }}>
              <TabButton tab="topology" active={tab === 'topology'} onClick={() => setTab('topology')} label="🔗 Connection Topology" />
              <TabButton tab="platforms" active={tab === 'platforms'} onClick={() => setTab('platforms')} label="🌊 Platform Mesh" />
              <TabButton tab="trajectory" active={tab === 'trajectory'} onClick={() => setTab('trajectory')} label="📈 30-Day Trajectory" />
              {graph.warning && (
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#ffaa0088', padding: '3px 8px', background: '#ffaa0011', borderRadius: '8px', border: '1px solid #ffaa0022' }}>
                  ⚠ {graph.warning.split('—')[0].trim()}
                </span>
              )}
            </div>

            {tab === 'topology' && (
              <>
                <ForceGraph data={graph} onNodeClick={handleNodeClick} />
                {selectedNode && (
                  <div style={{ marginTop: '16px' }}>
                    <NodeDetailPanel node={selectedNode} onClose={() => { setSelectedNode(null); }} />
                  </div>
                )}
              </>
            )}

            {tab === 'platforms' && platforms && (
              <PlatformMesh data={platforms} />
            )}

            {tab === 'trajectory' && (
              <>
                <ImprovementChart data={metrics.history} />
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'KB Nodes', value: metrics.knowledgeBase.totalNodes.toLocaleString(), color: '#00ccff', trend: `+${metrics.knowledgeBase.growthRate}/day` },
                    { label: 'API Requests', value: metrics.apiBrain.totalRequests.toLocaleString(), color: '#ffaa00', trend: `${metrics.apiBrain.avgLatencyMs}ms avg` },
                    { label: 'Insights', value: metrics.secondaryBrain.insightsGenerated.toLocaleString(), color: '#cc88ff', trend: `${(metrics.secondaryBrain.accuracyScore * 100).toFixed(0)}% accuracy` },
                    { label: 'Brain Score', value: String(metrics.improvement.overall.score), color: '#00ff88', trend: `▲ ${metrics.improvement.overall.trend}% this month` },
                  ].map(({ label, value, color, trend }) => (
                    <div key={label} style={{ padding: '12px', background: '#070710', borderRadius: '8px', border: '1px solid #1a1a2e' }}>
                      <div style={{ fontSize: '10px', color: '#333', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                      <div style={{ fontSize: '22px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: '10px', color: '#444', marginTop: '4px' }}>{trend}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Data Flow Ticker */}
          <div style={{ background: '#0d0d18', border: '1px solid #111', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '13px', color: '#00ff88', fontWeight: 600 }}>⚡ Live Data Flow</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#333' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                streaming
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#222', fontFamily: 'monospace', display: 'grid', gridTemplateColumns: '58px 90px 120px 1fr', gap: '6px', marginBottom: '8px', padding: '0 8px' }}>
              <span>TIME</span><span>PLATFORM</span><span>ACTION</span><span>DETAIL</span>
            </div>
            <DataFlowTicker liveEvents={logs} />
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#0d0d18', border: '1px solid #111', borderRadius: '12px', padding: '16px 20px' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '13px', color: '#00ff88', fontWeight: 600 }}>📊 Brain Health</h2>
            <MetricsPanel metrics={metrics} health={health} />
          </div>

          <div style={{ background: '#0d0d18', border: '1px solid #111', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '13px', color: '#00ff88', fontWeight: 600 }}>📡 SSE Connection Log</h2>
              <span style={{ fontSize: '10px', color: '#333' }}>{logs.length} events</span>
            </div>
            <ConnectionLog logs={logs} />
          </div>

          {/* Quick stats footer */}
          <div style={{ padding: '14px 16px', background: '#0d0d18', border: '1px solid #111', borderRadius: '12px', fontSize: '11px' }}>
            <div style={{ fontSize: '10px', color: '#333', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Row label="SSE clients" value={health.systems.sse.connections.totalClients} />
              <Row label="Graphify circuit" value={health.systems.graphify.circuitState.state} color={health.systems.graphify.circuitState.state === 'CLOSED' ? '#00ff88' : '#ffaa00'} />
              <Row label="MCP circuit" value={health.systems.mcp.circuitState.state} color={health.systems.mcp.circuitState.state === 'CLOSED' ? '#00ff88' : '#ffaa00'} />
              <Row label="Graph source" value={graph.source || 'unknown'} color={graph.source?.includes('live') ? '#00ff88' : '#ffaa00'} />
              <Row label="Metrics source" value={metrics.source || 'unknown'} color={metrics.source?.includes('live') ? '#00ff88' : '#ffaa00'} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, color = '#555' }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#333' }}>{label}</span>
      <span style={{ color, fontFamily: 'monospace', fontSize: '10px' }}>{value}</span>
    </div>
  );
}
