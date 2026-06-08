'use client';

interface PlatformEndpoint {
  path: string;
  calls: number;
  avgMs: number;
}

interface Platform {
  id: string;
  name: string;
  status: string;
  latencyMs: number;
  requestsToday: number;
  lastSync: string;
  endpoints?: PlatformEndpoint[];
  dataFlowMbps?: number;
  healthScore: number;
  circuitState?: string;
  failures?: number;
  toolsAvailable?: number;
  invocationsToday?: number;
}

interface IntegrationLink {
  from: string;
  to: string;
  label: string;
  trafficMbps: number;
  bidirectional: boolean;
}

interface PlatformData {
  source: string;
  finsurfing: Platform;
  promptEngineering: Platform;
  graphify: Platform;
  mcp: Platform;
  integrationLinks: IntegrationLink[];
}

const STATUS_DOT: Record<string, { color: string; glow: string; label: string }> = {
  active: { color: '#00ff88', glow: '#00ff8866', label: 'Active' },
  degraded: { color: '#ffaa00', glow: '#ffaa0066', label: 'Degraded' },
  error: { color: '#ff0044', glow: '#ff004466', label: 'Error' },
  inactive: { color: '#444', glow: '#44444466', label: 'Offline' },
};

function HealthBar({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444', marginBottom: '4px' }}>
        <span>Health</span><span style={{ color }}>{score}%</span>
      </div>
      <div style={{ height: '4px', background: '#1a1a2e', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '2px', boxShadow: `0 0 6px ${color}`, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function PlatformCard({ platform, color, icon }: { platform: Platform; color: string; icon: string }) {
  const st = STATUS_DOT[platform.status] || STATUS_DOT.inactive;
  return (
    <div style={{ background: '#0d0d18', border: `1px solid ${color}33`, borderRadius: '10px', padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>{icon}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#e0e0e0' }}>{platform.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.color, boxShadow: `0 0 8px ${st.glow}`, display: 'inline-block', animation: platform.status === 'active' ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '11px', color: st.color }}>{st.label}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', marginBottom: '8px' }}>
        {platform.latencyMs !== undefined && <Stat label="Latency" value={`${platform.latencyMs}ms`} color="#aaa" />}
        {platform.requestsToday !== undefined && <Stat label="Req/day" value={platform.requestsToday.toLocaleString()} color="#aaa" />}
        {platform.dataFlowMbps !== undefined && <Stat label="Flow" value={`${platform.dataFlowMbps} Mbps`} color={color} />}
        {platform.circuitState && <Stat label="Circuit" value={platform.circuitState} color={platform.circuitState === 'CLOSED' ? '#00ff88' : platform.circuitState === 'HALF_OPEN' ? '#ffaa00' : '#ff0044'} />}
        {platform.toolsAvailable !== undefined && <Stat label="Tools" value={String(platform.toolsAvailable)} color="#aaa" />}
        {platform.invocationsToday !== undefined && <Stat label="Invocations" value={platform.invocationsToday.toLocaleString()} color="#aaa" />}
      </div>

      <HealthBar score={platform.healthScore} color={color} />

      {platform.endpoints && platform.endpoints.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Top Endpoints</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {platform.endpoints.slice(0, 3).map(ep => (
              <div key={ep.path} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '4px 6px', background: '#070710', borderRadius: '4px' }}>
                <span style={{ color: '#555', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{ep.path}</span>
                <span style={{ color: '#444', whiteSpace: 'nowrap', marginLeft: '8px' }}>{ep.calls.toLocaleString()} · {ep.avgMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ color: '#444', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <span style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function PlatformMesh({ data }: { data: PlatformData }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#444' }}>
          {data.integrationLinks.length} active integration links across {4} platforms
        </div>
        <div style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '10px', background: data.source?.includes('graphify-live') ? '#00ff8822' : '#ffaa0022', color: data.source?.includes('graphify-live') ? '#00ff88' : '#ffaa00', border: `1px solid ${data.source?.includes('graphify-live') ? '#00ff8844' : '#ffaa0044'}` }}>
          {data.source?.includes('graphify-live') ? '● graphify-live' : '◌ synthetic'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        <PlatformCard platform={data.finsurfing} color="#ff9944" icon="🏄" />
        <PlatformCard platform={data.promptEngineering} color="#cc88ff" icon="🔮" />
        <PlatformCard platform={data.graphify} color="#00ccff" icon="⚙️" />
        <PlatformCard platform={data.mcp} color="#ffaa00" icon="🔌" />
      </div>

      <div>
        <div style={{ fontSize: '12px', color: '#333', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Integration Links</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.integrationLinks.map((link, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#0d0d18', borderRadius: '6px', border: '1px solid #1a1a2e', fontSize: '11px' }}>
              <span style={{ color: '#555', fontFamily: 'monospace', minWidth: '80px' }}>{link.from}</span>
              <span style={{ color: '#333' }}>{link.bidirectional ? '⟺' : '→'}</span>
              <span style={{ color: '#555', fontFamily: 'monospace', minWidth: '80px' }}>{link.to}</span>
              <span style={{ color: '#444', flex: 1 }}>{link.label}</span>
              <span style={{ color: '#00ccff', whiteSpace: 'nowrap' }}>{link.trafficMbps} Mbps</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
