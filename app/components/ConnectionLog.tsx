'use client';

export default function ConnectionLog({ logs }: { logs: any[] }) {
  const typeColors: Record<string, string> = {
    graphify_update: '#00ff88',
    webhook_ingested: '#00ccff',
    mcp_result: '#ffaa00',
    error: '#ff0044',
    system: '#888',
  };

  return (
    <div style={{ maxHeight: '320px', overflowY: 'auto', fontSize: '12px', fontFamily: 'monospace' }}>
      {logs.length === 0 ? (
        <div style={{ color: '#333', textAlign: 'center', padding: '40px 0' }}>
          Waiting for connections...
        </div>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '50px 80px 100px 1fr 60px',
              gap: '8px',
              padding: '6px 8px',
              borderBottom: '1px solid #111',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#333' }}>{log.time}</span>
            <span style={{ color: typeColors[log.type] || '#888' }}>{log.type}</span>
            <span style={{ color: '#555' }}>{log.source}</span>
            <span style={{ color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {log.message}
            </span>
            <span style={{
              color: log.status === 'success' || log.status === 'ingested' ? '#00ff88' : log.status === 'queued' ? '#ffaa00' : '#ff0044',
              fontSize: '10px',
              textTransform: 'uppercase',
            }}>
              {log.status}
            </span>
          </div>
        ))
      )}
    </div>
  );
}