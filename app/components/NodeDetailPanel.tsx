'use client';

interface Node {
  id: string;
  label: string;
  type: string;
  status: string;
  edges: number;
  size: number;
}

const TYPE_COLORS: Record<string, string> = {
  brain: '#00ff88', engine: '#00ccff', interface: '#ffaa00',
  infrastructure: '#cc88ff', source: '#ff6688', storage: '#88ccff', platform: '#ff9944',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#00ff88', warning: '#ffaa00', degraded: '#ff6600', error: '#ff0044', inactive: '#444',
};

export default function NodeDetailPanel({ node, onClose }: { node: Node; onClose: () => void }) {
  const color = TYPE_COLORS[node.type] || '#888';
  const statusColor = STATUS_COLORS[node.status] || '#888';

  return (
    <div style={{ background: '#0d0d18', border: `1px solid ${color}44`, borderRadius: '12px', padding: '20px', animation: 'slideIn 0.15s ease', position: 'relative' }}>
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
      >✕</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}` }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#e0e0e0' }}>{node.label}</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{node.type}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        {[
          { label: 'Status', value: node.status, valueColor: statusColor },
          { label: 'ID', value: node.id, valueColor: '#555' },
          { label: 'Connections', value: String(node.edges), valueColor: '#aaa' },
          { label: 'Size (nodes)', value: node.size.toLocaleString(), valueColor: '#aaa' },
        ].map(({ label, value, valueColor }) => (
          <div key={label} style={{ padding: '10px', background: '#070710', borderRadius: '8px', border: '1px solid #1a1a2e' }}>
            <div style={{ fontSize: '10px', color: '#444', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: valueColor, fontFamily: label === 'ID' ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px', background: '#070710', borderRadius: '8px', border: '1px solid #1a1a2e' }}>
        <div style={{ fontSize: '10px', color: '#444', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Capacity utilization</div>
        <div style={{ height: '6px', background: '#1a1a2e', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, (node.edges / 20) * 100)}%`,
            height: '100%',
            background: color,
            borderRadius: '3px',
            boxShadow: `0 0 6px ${color}`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: '10px', color: '#444', marginTop: '4px' }}>{node.edges} / 20 active links</div>
      </div>
    </div>
  );
}
