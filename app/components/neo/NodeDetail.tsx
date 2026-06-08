'use client';
import { motion } from 'framer-motion';
import { graph, type GraphNode } from '@/lib/neo-mock';
import { X } from 'lucide-react';

export function NodeDetail({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const edges = graph.links.filter(l => l.source === node.id || l.target === node.id);
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="border-t p-4" style={{ borderColor: 'var(--neo-border)', background: 'rgba(0,0,0,0.2)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--neo-muted)' }}>{node.type}</div>
          <div className="text-base font-semibold" style={{ color: 'var(--neo-text)' }}>{node.label}</div>
        </div>
        <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: 'var(--neo-muted)' }}><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Stat label="Status" value={node.status} color={node.status === 'healthy' ? '#10b981' : node.status === 'degraded' ? '#f59e0b' : '#ef4444'} />
        <Stat label="Size" value={node.size.toLocaleString()} />
        <Stat label="Edges" value={String(edges.length)} />
      </div>
      <div className="mb-2 flex justify-between text-[11px]" style={{ color: 'var(--neo-muted)' }}>
        <span>Capacity</span><span className="font-mono">{node.capacity}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--neo-border)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${node.capacity}%` }}
          transition={{ type: 'spring', stiffness: 80, damping: 14 }}
          className="h-full rounded-full"
          style={{ background: node.capacity > 80 ? '#ef4444' : node.capacity > 60 ? '#f59e0b' : '#10b981' }} />
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--neo-muted)' }}>Connections</div>
      <div className="flex flex-wrap gap-1.5">
        {edges.map((l, i) => {
          const other = l.source === node.id ? l.target : l.source;
          return (
            <span key={i} className="text-[10px] font-mono px-2 py-1 rounded-md border"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--neo-border)', color: 'var(--neo-muted)' }}>
              {other} <span style={{ color: 'var(--neo-faint)' }}>·</span> <span style={{ color: 'var(--neo-secondary)' }}>{l.traffic}</span>
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--neo-muted)' }}>{label}</div>
      <div className="text-sm font-semibold" style={{ color: color || 'var(--neo-text)' }}>{value}</div>
    </div>
  );
}
