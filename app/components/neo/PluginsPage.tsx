'use client';
import { motion } from 'framer-motion';
import { plugins } from '@/lib/neo-mock';

export function PluginsPage() {
  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>Plugins</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>Agent extensions that modify behavior and add capabilities</p>
        </div>
        <button style={{
          fontSize: '13px', fontWeight: 600, padding: '7px 14px', borderRadius: '8px',
          background: 'var(--neo-primary)', color: '#fff', border: 'none', cursor: 'pointer',
        }}>+ Install Plugin</button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        {plugins.map((plugin, i) => (
          <motion.div
            key={plugin.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.05 }}
            style={{
              background: 'var(--neo-surface)',
              border: '1px solid var(--neo-border)',
              borderRadius: '12px',
              padding: '18px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
            whileHover={{ borderColor: plugin.color }}
          >
            {/* Icon + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: plugin.color + '22', border: `1px solid ${plugin.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>{plugin.icon}</div>
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                background: plugin.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                color: plugin.status === 'active' ? '#10b981' : '#f59e0b',
              }}>{plugin.status === 'active' ? 'Active' : 'Update'}</span>
            </div>
            {/* Name */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neo-text)' }}>{plugin.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--neo-muted)', marginTop: '2px' }}>{plugin.subtitle}</div>
            </div>
            {/* Description */}
            <p style={{ fontSize: '12px', color: 'var(--neo-muted)', margin: 0, lineHeight: 1.55, flex: 1 }}>{plugin.description}</p>
            {/* Footer */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)', color: 'var(--neo-muted)',
                border: '1px solid var(--neo-border)', fontFamily: 'monospace',
              }}>{plugin.version}</span>
              <span style={{
                fontSize: '10px', padding: '2px 8px', borderRadius: '8px',
                background: plugin.color + '18', color: plugin.color,
                border: `1px solid ${plugin.color}33`,
              }}>{plugin.tag}</span>
            </div>
          </motion.div>
        ))}

        {/* Browse Plugin Store card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: plugins.length * 0.05 }}
          style={{
            border: '2px dashed var(--neo-border)',
            borderRadius: '12px',
            padding: '18px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            minHeight: '180px',
          }}
          whileHover={{ borderColor: 'rgba(99,102,241,0.5)' }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', color: '#a5b4fc',
          }}>+</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--neo-text)' }}>Browse Plugin Store</div>
            <div style={{ fontSize: '11px', color: 'var(--neo-muted)', marginTop: '4px' }}>Discover new agent extensions</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
