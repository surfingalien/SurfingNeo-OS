'use client';

import { useTheme } from '../theme';

interface Node { id: string; label: string; type: string; status: string; edges: number; size: number; }

export default function NodeDetailPanel({ node, onClose }: { node: Node; onClose: () => void }) {
  const t = useTheme();
  const statusColor = node.status === 'active' ? t.success : node.status === 'warning' ? t.warning : t.error;

  return (
    <div style={{ background: t.bgDeep, border: `1px solid ${t.primaryBorder}`, borderRadius: '12px', padding: '20px', animation: 'slideIn 0.15s ease', position: 'relative' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: t.textFaint, cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>✕</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.primary, boxShadow: `0 0 10px ${t.primary}` }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: t.text }}>{node.label}</div>
          <div style={{ fontSize: '11px', color: t.textFaint, marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{node.type}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {[{ label: 'Status', value: node.status, color: statusColor }, { label: 'ID', value: node.id, color: t.textFaint }, { label: 'Connections', value: String(node.edges), color: t.textMuted }, { label: 'Size (nodes)', value: node.size.toLocaleString(), color: t.textMuted }].map(({ label, value, color }) => (
          <div key={label} style={{ padding: '10px', background: t.panel, borderRadius: '8px', border: `1px solid ${t.border}` }}>
            <div style={{ fontSize: '10px', color: t.textFaint, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '13px', color, fontFamily: label === 'ID' ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px', background: t.panel, borderRadius: '8px', border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: '10px', color: t.textFaint, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Capacity utilization</div>
        <div style={{ height: '6px', background: t.border, borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, (node.edges / 20) * 100)}%`, height: '100%', background: t.primary, borderRadius: '3px', boxShadow: `0 0 6px ${t.primary}`, transition: 'width 0.5s ease' }} />
        </div>
        <div style={{ fontSize: '10px', color: t.textFaint, marginTop: '4px' }}>{node.edges} / 20 active links</div>
      </div>
    </div>
  );
}
