'use client';

export default function MetricsPanel({ metrics, health }: { metrics: any; health: any }) {
  const m = metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Overall Score */}
      <div style={{ textAlign: 'center', padding: '16px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #1a1a2e' }}>
        <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#00ff88' }}>
          {m.improvement.overall.score}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>Overall Brain Score</div>
        <div style={{ fontSize: '13px', color: m.improvement.overall.trend > 0 ? '#00ff88' : '#ff6688', marginTop: '4px' }}>
          {m.improvement.overall.trend > 0 ? '▲' : '▼'} {Math.abs(m.improvement.overall.trend)}% — {m.improvement.overall.label}
        </div>
      </div>

      {/* Individual Brains */}
      <BrainScore
        name="API Brain"
        score={m.improvement.apiBrain.score}
        trend={m.improvement.apiBrain.trend}
        label={m.improvement.apiBrain.label}
        details={[
          { label: 'Requests', value: m.apiBrain.totalRequests.toLocaleString() },
          { label: 'Latency', value: `${m.apiBrain.avgLatencyMs}ms` },
          { label: 'Uptime', value: `${m.apiBrain.uptimePercent}%` },
          { label: 'Errors', value: `${(m.apiBrain.errorRate * 100).toFixed(2)}%` },
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
          { label: 'Growth', value: `+${m.knowledgeBase.growthRate}/day` },
          { label: 'Health', value: `${m.knowledgeBase.syncHealth}%` },
        ]}
      />

      {/* Connections */}
      <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #1a1a2e' }}>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Active Connections</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
          <Metric label="Webhooks" value={m.connections.activeWebhooks} />
          <Metric label="SSE Clients" value={health.systems.sse.connections.totalClients} />
          <Metric label="MCP Tools" value={m.connections.mcpToolsAvailable} />
          <Metric label="MCP Calls Today" value={m.connections.mcpInvocationsToday} />
        </div>
      </div>
    </div>
  );
}

function BrainScore({ name, score, trend, label, details }: any) {
  const barWidth = `${score}%`;
  const barColor = score > 85 ? '#00ff88' : score > 70 ? '#ffaa00' : '#ff6688';

  return (
    <div style={{ padding: '12px', background: '#0a0a0f', borderRadius: '8px', border: '1px solid #1a1a2e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: '600' }}>{name}</span>
        <span style={{ fontSize: '12px', color: trend > 0 ? '#00ff88' : '#ff6688' }}>
          {score} {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      </div>
      <div style={{ height: '4px', background: '#1a1a2e', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ width: barWidth, height: '100%', background: barColor, borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
        {details.map((d: any) => (
          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555' }}>{d.label}</span>
            <span style={{ color: '#aaa' }}>{d.value}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: '#444', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#555' }}>{label}</span>
      <span style={{ color: '#00ff88', fontWeight: '600' }}>{value}</span>
    </div>
  );
}