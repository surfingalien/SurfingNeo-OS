'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { mcpServers } from '@/lib/neo-mock';

const SERVER_ICONS: Record<string, string> = {
  claude: '🧠', groq: '⚡', finnhub: '📈', fmp: '💹', fred: '🏛️',
  edgar: '📋', finra: '📊', reddit: '💬', binance: '₿', postgres: '🗄️',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    connected: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'connected' },
    conditional: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'conditional' },
    degraded: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'degraded' },
    disconnected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'disconnected' },
  };
  const s = map[status] ?? map.disconnected;
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px',
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

interface PlatformStatus {
  ok: boolean;
  latencyMs: number | null;
  checked: string;
}

export function MCPServersPage() {
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/platform-status')
      .then(r => r.json())
      .then(d => {
        setPlatformStatus({
          ok: d.platforms?.finsurfing?.ok ?? false,
          latencyMs: d.platforms?.finsurfing?.latencyMs,
          checked: d.checked,
        });
      })
      .catch(() => setPlatformStatus({ ok: false, latencyMs: null, checked: new Date().toISOString() }))
      .finally(() => setLoading(false));
  }, []);

  const connected = mcpServers.filter(s => s.status === 'connected').length;

  return (
    <div className="neo-page-padding">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>MCP Servers</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>Model Context Protocol data providers · FinSurfing</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Live platform health */}
          <div style={{
            fontSize: '12px', padding: '6px 12px', borderRadius: '8px',
            background: loading ? 'rgba(100,116,139,0.1)' : platformStatus?.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: loading ? '#94a3b8' : platformStatus?.ok ? '#10b981' : '#ef4444',
            border: `1px solid ${loading ? 'rgba(100,116,139,0.2)' : platformStatus?.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {loading ? 'Checking...' : platformStatus?.ok
              ? `FinSurfing live · ${platformStatus.latencyMs}ms`
              : 'FinSurfing unreachable'}
          </div>
          <span style={{
            fontSize: '12px', padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            {connected} / {mcpServers.length} active
          </span>
          <button style={{
            fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '8px',
            background: 'var(--neo-primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>+ Add Server</button>
        </div>
      </div>

      {/* Grid */}
      <div className="neo-card-grid">
        {mcpServers.map((server, i) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            style={{
              background: 'var(--neo-surface)',
              border: '1px solid var(--neo-border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
            }}
            whileHover={{ borderColor: server.color }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: server.color + '22', border: `1px solid ${server.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>{SERVER_ICONS[server.id] ?? '🔌'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--neo-text)' }}>{server.name}</span>
                  <StatusBadge status={server.status} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--neo-muted)', marginTop: '2px' }}>{server.protocol}</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--neo-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>{server.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: server.color, display: 'inline-block' }} />
                <code style={{ fontSize: '11px', color: 'var(--neo-muted)', fontFamily: 'monospace' }}>{server.model}</code>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--neo-faint)' }}>{server.tools} tools</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
