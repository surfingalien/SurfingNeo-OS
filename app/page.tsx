'use client';

import { useEffect, useRef, useState } from 'react';
import ForceGraph from './components/ForceGraph';
import MetricsPanel from './components/MetricsPanel';
import ImprovementChart from './components/ImprovementChart';
import ConnectionLog from './components/ConnectionLog';

export default function Dashboard() {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [graph, setGraph] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Fetch initial data
    Promise.all([
      fetch('/api/health').then(r => r.json()),
      fetch('/api/metrics').then(r => r.json()),
      fetch('/api/graph').then(r => r.json()),
    ]).then(([h, m, g]) => {
      setHealth(h);
      setMetrics(m);
      setGraph(g);
    });

    // SSE for real-time updates
    const es = new EventSource('/api/stream?projectId=agentic-os');
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type !== 'connected') {
        setLogs(prev => [{
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          type: data.type,
          source: data.siteName || data.source || 'system',
          message: data.eventType || data.query || 'update',
          status: data.graphifyStatus || 'success',
        }, ...prev].slice(0, 50));
      }
    };

    // Poll health every 5s
    const interval = setInterval(() => {
      fetch('/api/health').then(r => r.json()).then(setHealth);
    }, 5000);

    return () => {
      es.close();
      clearInterval(interval);
    };
  }, []);

  if (!health || !metrics || !graph) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f', color: '#00ff88' }}>
        <div>Initializing neural mesh...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0f', color: '#e0e0e0', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1a1a2e', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#00ff88', letterSpacing: '-0.5px' }}>
            🧠 Agentic OS Neural Mesh
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
            Knowledge Base · API Brain · Secondary Brain · Live Connections
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <StatusBadge label="Graphify" status={health.systems.graphify.status} />
          <StatusBadge label="MCP" status={health.systems.mcp.status} />
          <StatusBadge label="SSE" status={health.systems.sse.status} />
          <div style={{ fontSize: '12px', color: '#444', marginLeft: '8px' }}>
            {new Date(health.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </header>

      <main style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left: Graph Visualization */}
        <div>
          <div style={{ background: '#111118', border: '1px solid #1a1a2e', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#00ff88' }}>🔗 Connection Topology</h2>
            <ForceGraph data={graph} />
          </div>

          <div style={{ background: '#111118', border: '1px solid #1a1a2e', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#00ff88' }}>📈 30-Day Improvement Trajectory</h2>
            <ImprovementChart data={metrics.history} />
          </div>
        </div>

        {/* Right: Metrics & Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#111118', border: '1px solid #1a1a2e', borderRadius: '12px', padding: '20px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#00ff88' }}>📊 Brain Health</h2>
            <MetricsPanel metrics={metrics} health={health} />
          </div>

          <div style={{ background: '#111118', border: '1px solid #1a1a2e', borderRadius: '12px', padding: '20px', flex: 1, minHeight: 0 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', color: '#00ff88' }}>⚡ Live Connection Log</h2>
            <ConnectionLog logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  const colors: Record<string, string> = {
    healthy: '#00ff88',
    degraded: '#ffaa00',
    warning: '#ff6600',
    error: '#ff0044',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[status] || '#666', boxShadow: `0 0 8px ${colors[status] || '#666'}` }} />
      <span style={{ color: '#888' }}>{label}</span>
    </div>
  );
}