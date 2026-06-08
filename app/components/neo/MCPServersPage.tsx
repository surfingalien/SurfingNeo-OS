'use client';
import { motion } from 'framer-motion';
import { mcpServers } from '@/lib/neo-mock';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    connected: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'connected' },
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

export function MCPServersPage() {
  const connected = mcpServers.filter(s => s.status === 'connected').length;

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>MCP Servers</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>Model Context Protocol data providers</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '12px', padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            {connected} / {mcpServers.length} connected
          </span>
          <button style={{
            fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '8px',
            background: 'var(--neo-primary)', color: '#fff', border: 'none', cursor: 'pointer',
          }}>+ Add Server</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
              transition: 'border-color 0.2s',
            }}
            whileHover={{ borderColor: server.color }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
              {/* Icon */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: server.color + '22', border: `1px solid ${server.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', flexShrink: 0,
              }}>🗄️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
