'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../theme';

function BrainScore({ name, score, trend, label, details, circuitState }: any) {
  const t = useTheme();
  const [animated, setAnimated] = useState(0);
  useEffect(() => { const id = setTimeout(() => setAnimated(score), 100); return () => clearTimeout(id); }, [score]);

  const barColor = score > 85 ? t.success : score > 70 ? t.warning : t.error;
  const circuitColor = circuitState === 'CLOSED' ? t.success : circuitState === 'HALF_OPEN' ? t.warning : t.error;

  return (
    <div style={{ padding: '14px', background: t.bgDeep, borderRadius: '10px', border: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: t.text }}>{name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {circuitState && (
            <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', background: circuitColor + '22', color: circuitColor, border: `1px solid ${circuitColor}44`, fontFamily: 'monospace' }}>
              {circuitState}
            </span>
          )}
          <span style={{ fontSize: '13px', fontWeight: 700, color: barColor }}>{score}</span>
          <span style={{ fontSize: '11px', color: trend > 0 ? t.success : t.error }}>{trend > 0 ? '▲' : '▼'}{Math.abs(trend)}%</span>
        </div>
      </div>
      <div style={{ height: '5px', background: t.border, borderRadius: '3px', marginBottom: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${animated}%`, height: '100%', background: barColor, borderRadius: '3px', boxShadow: `0 0 8px ${barColor}44`, transition: 'width 0.8s ease' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px' }}>
        {details.map((d: any) => (
          <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
            <span style={{ color: t.textFaint }}>{d.label}</span>
            <span style={{ color: t.textMuted }}>{d.value}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '9px', color: t.textFaint, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

export default function MetricsPanel({ metrics, health }: { metrics: any; health: any }) {
  const t = useTheme();
  const m = metrics;
  const overallColor = m.improvement.overall.score > 85 ? t.success : m.improvement.overall.score > 70 ? t.warning : t.error;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ textAlign: 'center', padding: '18px', background: t.bgDeep, borderRadius: '10px', border: `1px solid ${overallColor}33` }}>
        <div style={{ fontSize: '48px', fontWeight: 800, color: overallColor, lineHeight: 1, textShadow: `0 0 20px ${overallColor}66` }}>
          {m.improvement.overall.score}
        </div>
        <div style={{ fontSize: '11px', color: t.textFaint, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Brain Score</div>
        <div style={{ fontSize: '12px', color: m.improvement.overall.trend > 0 ? t.success : t.error, marginTop: '6px' }}>
          {m.improvement.overall.trend > 0 ? '▲' : '▼'} {Math.abs(m.improvement.overall.trend)}% · {m.improvement.overall.label}
        </div>
        {m.source && <div style={{ fontSize: '9px', color: t.textFaint, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>source: {m.source}</div>}
      </div>

      <BrainScore name="API Brain" score={m.improvement.apiBrain.score} trend={m.improvement.apiBrain.trend} label={m.improvement.apiBrain.label} circuitState={m.apiBrain.circuitState}
        details={[{ label: 'Requests', value: m.apiBrain.totalRequests.toLocaleString() }, { label: 'Avg latency', value: `${m.apiBrain.avgLatencyMs}ms` }, { label: 'p99 latency', value: `${m.apiBrain.p99LatencyMs}ms` }, { label: 'Uptime', value: `${m.apiBrain.uptimePercent}%` }, { label: 'Error rate', value: `${(m.apiBrain.errorRate * 100).toFixed(2)}%` }, { label: 'CB breaks', value: m.apiBrain.circuitBreaks }]}
      />
      <BrainScore name="Secondary Brain" score={m.improvement.secondaryBrain.score} trend={m.improvement.secondaryBrain.trend} label={m.improvement.secondaryBrain.label}
        details={[{ label: 'Insights', value: m.secondaryBrain.insightsGenerated.toLocaleString() }, { label: 'Accuracy', value: `${(m.secondaryBrain.accuracyScore * 100).toFixed(0)}%` }, { label: 'Model', value: m.secondaryBrain.modelVersion }, { label: 'Learning', value: `${(m.secondaryBrain.learningRate * 100).toFixed(0)}%` }]}
      />
      <BrainScore name="Knowledge Graph" score={m.improvement.knowledgeGraph.score} trend={m.improvement.knowledgeGraph.trend} label={m.improvement.knowledgeGraph.label}
        details={[{ label: 'Nodes', value: m.knowledgeBase.totalNodes.toLocaleString() }, { label: 'Edges', value: m.knowledgeBase.totalEdges.toLocaleString() }, { label: 'Growth/day', value: `+${m.knowledgeBase.growthRate}` }, { label: 'Sync health', value: `${m.knowledgeBase.syncHealth}%` }]}
      />

      <div style={{ padding: '14px', background: t.bgDeep, borderRadius: '10px', border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: '11px', color: t.textFaint, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Connections</div>
        {[
          ['Active webhooks', m.connections.activeWebhooks, t.primary],
          ['SSE clients', health.systems.sse.connections.totalClients, t.primary],
          ['MCP tools', m.connections.mcpToolsAvailable, t.primary],
          ['MCP calls today', m.connections.mcpInvocationsToday, t.primary],
        ].map(([label, value, color]: any) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '11px' }}>
            <span style={{ color: t.textFaint }}>{label}</span>
            <span style={{ color, fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
