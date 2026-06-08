'use client';

import { useState } from 'react';
import { useTheme } from '../theme';

interface LogEntry { id: string; time: string; type: string; source: string; message: string; status: string; }

export default function ConnectionLog({ logs }: { logs: LogEntry[] }) {
  const t = useTheme();
  const [filter, setFilter] = useState('all');
  const types = ['all', ...Array.from(new Set(logs.map(l => l.type)))];
  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  const typeColor = (type: string) => {
    if (type.includes('graphify')) return t.secondary;
    if (type.includes('webhook')) return t.success;
    if (type.includes('mcp')) return t.warning;
    if (type.includes('error')) return t.error;
    return t.textFaint;
  };
  const statusColor = (s: string) => s === 'success' || s === 'ingested' ? t.success : s === 'queued' ? t.warning : t.error;

  return (
    <div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {types.slice(0, 6).map(type => (
          <button key={type} onClick={() => setFilter(type)} style={{ background: filter === type ? t.borderStrong : 'none', border: `1px solid ${filter === type ? t.borderStrong : t.border}`, borderRadius: '8px', padding: '2px 8px', fontSize: '9px', color: filter === type ? t.primary : t.textFaint, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            {type}
          </button>
        ))}
      </div>
      <div style={{ maxHeight: '260px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}>
        {filtered.length === 0 ? (
          <div style={{ color: t.textFaint, textAlign: 'center', padding: '40px 0', fontSize: '12px' }}>
            {logs.length === 0 ? 'Waiting for connections...' : 'No events match this filter'}
          </div>
        ) : filtered.map((log, i) => (
          <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 80px 50px', gap: '6px', padding: '5px 8px', borderBottom: `1px solid ${t.bgDeep}`, alignItems: 'center', animation: i === 0 ? 'slideIn 0.2s ease' : 'none' }}>
            <span style={{ color: t.textFaint }}>{log.time}</span>
            <div style={{ overflow: 'hidden' }}>
              <span style={{ color: typeColor(log.type), marginRight: '6px' }}>{log.type}</span>
              <span style={{ color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</span>
            </div>
            <span style={{ color: t.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{log.source}</span>
            <span style={{ color: statusColor(log.status), fontSize: '9px', textTransform: 'uppercase', textAlign: 'right' }}>{log.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
