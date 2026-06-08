'use client';
import { motion } from 'framer-motion';
import { platforms } from '@/lib/neo-mock';

export function PlatformMesh() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      {platforms.map((p, i) => (
        <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
          className="rounded-lg p-4 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--neo-border)' }}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border flex items-center justify-center text-xl"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'var(--neo-border)' }}>
                {p.emoji}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--neo-text)' }}>{p.name}</div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: p.status === 'healthy' ? '#10b981' : '#f59e0b' }}>{p.status}</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-md font-mono"
              style={{
                background: p.latency < 50 ? 'rgba(16,185,129,0.15)' : p.latency < 100 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: p.latency < 50 ? '#10b981' : p.latency < 100 ? '#f59e0b' : '#ef4444',
              }}>{p.latency}ms</span>
          </div>
          <div className="mb-1 flex justify-between text-[10px]" style={{ color: 'var(--neo-muted)' }}>
            <span>HEALTH</span><span className="font-mono">{p.health}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--neo-border)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${p.health}%` }} transition={{ type: 'spring', stiffness: 80, damping: 16 }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(to right, var(--neo-primary), var(--neo-secondary))' }} />
          </div>
          <table className="w-full text-[11px] font-mono">
            <tbody>
              {p.endpoints.map(e => (
                <tr key={e.path} className="border-t" style={{ borderColor: 'rgba(30,33,48,0.6)' }}>
                  <td className="py-1.5" style={{ color: 'var(--neo-secondary)' }}>{e.method}</td>
                  <td className="py-1.5 truncate max-w-[120px]" style={{ color: 'var(--neo-muted)' }}>{e.path}</td>
                  <td className="py-1.5 text-right" style={{ color: 'var(--neo-muted)' }}>{e.latency}ms</td>
                  <td className="py-1.5 text-right pl-2"
                    style={{ color: e.status < 300 ? '#10b981' : e.status < 400 ? '#f59e0b' : '#ef4444' }}>{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ))}
    </div>
  );
}
