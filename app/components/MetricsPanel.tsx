'use client';

import { useEffect, useState } from 'react';

const CIRCUIT_COLORS: Record<string, string> = {
  CLOSED: '#00ff88', HALF_OPEN: '#ffaa00', OPEN: '#ff0044',
};

function CircuitBadge({ state }: { state: string }) {
  const color = CIRCUIT_COLORS[state] || '#555';
  return (
    <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: `${color}22`, color, border: `1px solid ${color}44`, fontFamily: 'monospace', letterSpacing: '0.3px' }}>
      {state}
    </span>
  );
}

function BrainScore({ name, score, trend, label, details, circuitState }: any) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const barColor = score > 85 ? '#00ff88' : score > 70 ? '#ffaa00' : '#ff6688';

  return (
    <div style={{ padding: '14px', background: '#070710', borderRadius: '10px', border: '1px solid #1a1a2e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#d0d0d0' }}>{name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {circuitState && <CircuitBadge state={circuitState} />}
          <span style={{ fontSize: '13px', fontWeight: 700, color: barColor }}>{score}</span>
          <span style={{ fontSize: '11px', color: trend > 0 ? '#00ff88' : '#ff6688' }}>
            {trend > 0 ? '▲' : '▼'}{Math.abs(trend)}%
          </span>
        </div>
      </div>
      <div style={{ height: '5px', background: '#1a1a2e', borderRadius: '3px', marginBottom: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${animated}%`, height: '100%', background: barColor, borderRadius: '3px', boxShadow: `0 0 8px ${barColor}44`, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
        {details.map((d: any) => (
          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
            <span style={{ color: '#444' }}>{d.label}</span>
            <span style={{ color: '#999' }}>{d.value}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '9px', color: '#333', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

function Metric({ label, value, color = '#00ff88' }: { label: string; value: number | string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ color: '#444', fontSize: '11px' }}>{label}</span>
      <span style={{ color, fontWeight: 600, fontSize: '11px' }}>{value}</span>
    </div>
  );
}

export default function MetricsPanel({ metrics, health }: { metrics: any; health: any }) {
  const m = metrics;
  const overallColor = m.improvement.overall.score > 85 ? '#00ff88' : m.improvement.overall.score > 70 ? '#ffaa00' : '#ff6688';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Overall Score */}
      <div style={{ textAlign: 'center', padding: '18px', background: '#070710', borderRadius: '10px', border: `1px solid ${overallColor}33` }}>
        <div style={{ fontSize: '48px', fontWeight: 800, color: overallColor, lineHeight: 1, textShadow: `0 0 20px ${overallColor}66` }}>
          {m.improvement.overall.score}
        </div>
        <div style={{ fontSize: '11px', color: '#444', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Brain Score</div>
        <div style={{ fontSize: '12px', color: m.improvement.overall.trend > 0 ? '#00ff88' : '#ff6688', marginTop: '6px' }}>
          {m.improvement.overall.trend > 0 ? '▲' : '▼'} {Math.abs(m.improvement.overall.trend)}% · {m.improvement.overall.label}
        </div>
        {m.source && (
          <div style={{ fontSize: '9px', color: '#333', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            source: {m.source}
          </div>
        )}
      </div>

      <BrainScore
        name="API Brain"
        score={m.improvement.apiBrain.score}
        trend={m.improvement.apiBrain.trend}
        label={m.improvement.apiBrain.label}
        circuitState={m.apiBrain.circuitState}
        details={[
          { label: 'Requests', value: m.apiBrain.totalRequests.toLocaleString() },
          { label: 'Avg latency', value: `${m.apiBrain.avgLatencyMs}ms` },
          { label: 'p99 latency', value: `${m.apiBrain.p99LatencyMs}ms` },
          { label: 'Uptime', value: `${m.apiBrain.uptimePercent}%` },
          { label: 'Error rate', value: `${(m.apiBrain.errorRate * 100).toFixed(2)}%` },
          { label: 'CB breaks', value: m.apiBrain.circuitBreaks },
        ]}
      />

      <BrainScore
        name="Secondary Brain"
        score={m.improvement.secondaryBrain.score}
        trend={m.improvement.secondaryBrain.trend}
        label={m.improvement.secondaryBrain.label}
        details={[
          { label: 'Insights', value: m.secondaryBrain.insightsGenerated.toLocaleString() },
          { label: 'Accuracy', value: `${(m.secondaryBrain.accuracyScore * 100).toFixed(0)}%` },
          { label: 'Model', value: m.secondaryBrain.modelVersion },
          { label: 'Learning', value: `${(m.secondaryBrain.learningRate * 100).toFixed(0)}%` },
        ]}
      />

      <BrainScore
        name="Knowledge Graph"
        score={m.improvement.knowledgeGraph.score}
        trend={m.improvement.knowledgeGraph.trend}
        label={m.improvement.knowledgeGraph.label}
        details={[
          { label: 'Nodes', value: m.knowledgeBase.totalNodes.toLocaleString() },
          { label: 'Edges', value: m.knowledgeBase.totalEdges.toLocaleString() },
          { label: 'Growth/day', value: `+${m.knowledgeBase.growthRate}` },
          { label: 'Sync health', value: `${m.knowledgeBase.syncHealth}%` },
        ]}
      />

      <div style={{ padding: '14px', background: '#070710', borderRadius: '10px', border: '1px solid #1a1a2e' }}>
        <div style={{ fontSize: '11px', color: '#444', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Connections</div>
        <Metric label="Active webhooks" value={m.connections.activeWebhooks} />
        <Metric label="SSE clients" value={health.systems.sse.connections.totalClients} />
        <Metric label="MCP tools" value={m.connections.mcpToolsAvailable} />
        <Metric label="MCP calls today" value={m.connections.mcpInvocationsToday} />
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #111' }}>
          <Metric label="Graphify circuit" value={health.systems.graphify.circuitState.state} color={CIRCUIT_COLORS[health.systems.graphify.circuitState.state]} />
          <Metric label="MCP circuit" value={health.systems.mcp.circuitState.state} color={CIRCUIT_COLORS[health.systems.mcp.circuitState.state]} />
        </div>
      </div>
    </div>
  );
}
