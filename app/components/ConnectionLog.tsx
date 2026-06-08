'use client';

import { useState } from 'react';

interface LogEntry {
  id: string;
  time: string;
  type: string;
  source: string;
  message: string;
  status: string;
}

const TYPE_COLORS: Record<string, string> = {
  graphify_update: '#00ccff',
  webhook_ingested: '#00ff88',
  mcp_result: '#ffaa00',
  error: '#ff0044',
  system: '#555',
  connected: '#00ff8866',
};

const STATUS_COLORS: Record<string, string> = {
  success: '#00ff88', ingested: '#00ff88', queued: '#ffaa00',
  error: '#ff0044', failed: '#ff0044',
};

export default function ConnectionLog({ logs }: { logs: LogEntry[] }) {
  const [filter, setFilter] = useState<string>('all');

  const types = ['all', ...Array.from(new Set(logs.map(l => l.type)))];
  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {types.slice(0, 6).map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              background: filter === t ? '#1a1a2e' : 'none',
              border: `1px solid ${filter === t ? '#333' : '#111'}`,
              borderRadius: '8px',
              padding: '2px 8px',
              fontSize: '9px',
              color: filter === t ? (TYPE_COLORS[t] || '#aaa') : '#333',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >{t}</button>
        ))}
      </div>

      <div style={{ maxHeight: '260px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}>
        {filtered.length === 0 ? (
          <div style={{ color: '#222', textAlign: 'center', padding: '40px 0', fontSize: '12px' }}>
            {logs.length === 0 ? 'Waiting for connections...' : 'No events match this filter'}
          </div>
        ) : (
          filtered.map((log, i) => (
            <div
              key={log.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '52px 1fr 80px 50px',
                gap: '6px',
                padding: '5px 8px',
                borderBottom: '1px solid #0d0d18',
                alignItems: 'center',
                animation: i === 0 ? 'slideIn 0.2s ease' : 'none',
              }}
            >
              <span style={{ color: '#2a2a3a' }}>{log.time}</span>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ color: TYPE_COLORS[log.type] || '#555', marginRight: '6px' }}>{log.type}</span>
                <span style={{ color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.message}</span>
              </div>
              <span style={{ color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{log.source}</span>
              <span style={{ color: STATUS_COLORS[log.status] || '#444', fontSize: '9px', textTransform: 'uppercase', textAlign: 'right' }}>{log.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
