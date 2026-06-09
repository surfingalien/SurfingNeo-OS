'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { mcpServers as fallbackServers } from '@/lib/neo-mock';

const SERVER_ICONS: Record<string, string> = {
  claude: '🧠', groq: '⚡', finnhub: '📈', fmp: '💹', fred: '🏛️',
  edgar: '📋', finra: '📊', reddit: '💬', binance: '₿', postgres: '🗄️',
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    connected: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    conditional: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    degraded: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    disconnected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  };
  const s = map[status] ?? map.disconnected;
  return (
    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px', background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

type McpServer = typeof fallbackServers[number];
type RegistryMeta = { lastSynced: string; mcpSource: 'live' | 'fallback'; mcpCount: number };

const POLL_INTERVAL = 30_000;

export function MCPServersPage() {
  const [servers, setServers] = useState<McpServer[]>(fallbackServers);
  const [meta, setMeta] = useState<RegistryMeta | null>(null);
  const [fsPing, setFsPing] = useState<{ ok: boolean; latencyMs: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const sync = useCallback(async () => {
    try {
      const [regRes, statusRes] = await Promise.all([
        fetch('/api/registry?type=mcps'),
        fetch('/api/platform-status'),
      ]);
      if (regRes.ok) {
        const d = await regRes.json();
        if (d.mcps?.length) setServers(d.mcps);
        setMeta(d.meta ?? null);
      }
      if (statusRes.ok) {
        const d = await statusRes.json();
        setFsPing({ ok: d.platforms?.finsurfing?.ok ?? false, latencyMs: d.platforms?.finsurfing?.latencyMs ?? null });
      }
    } catch { /* keep existing state */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    sync();
    const id = setInterval(sync, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [sync]);

  const connected = servers.filter(s => s.status === 'connected').length;

  return (
    <div className="neo-page-padding">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>MCP Servers</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>
            Model Context Protocol providers · {servers.length} registered
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Live FinSurfing health */}
          <div style={{
            fontSize: '11px', padding: '5px 10px', borderRadius: '8px',
            background: loading ? 'rgba(100,116,139,0.1)' : fsPing?.ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            color: loading ? '#94a3b8' : fsPing?.ok ? '#10b981' : '#ef4444',
            border: `1px solid ${loading ? 'rgba(100,116,139,0.2)' : fsPing?.ok ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
            {loading ? 'Syncing...' : fsPing?.ok ? `FinSurfing · ${fsPing.latencyMs}ms` : 'FinSurfing unreachable'}
          </div>
          {/* Registry source indicator */}
          {meta && (
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--neo-faint)' }}>
              {meta.mcpSource === 'live' ? '● live' : '○ cached'} · synced {new Date(meta.lastSynced).toLocaleTimeString()}
            </span>
          )}
          <span style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
            {connected}/{servers.length} active
          </span>
          <button onClick={sync} style={{ fontSize: '12px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', background: 'var(--neo-surface)', color: 'var(--neo-text)', border: '1px solid var(--neo-border)', cursor: 'pointer' }}>
            ⟳ Sync
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="neo-card-grid">
        {servers.map((server, i) => (
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.03 }}
            style={{ background: 'var(--neo-surface)', border: '1px solid var(--neo-border)', borderRadius: '12px', padding: '16px', cursor: 'pointer' }}
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
