'use client';

import { useEffect, useRef, useState } from 'react';

interface TickerEvent {
  id: string;
  time: string;
  platform: string;
  action: string;
  value: string;
  color: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  finsurfing: '#ff9944',
  'prompt-eng': '#cc88ff',
  graphify: '#00ccff',
  mcp: '#ffaa00',
  'api-brain': '#00ff88',
  'kb-core': '#00ff88',
  system: '#555',
};

function generateSyntheticEvent(): TickerEvent {
  const events = [
    { platform: 'finsurfing', action: 'portfolio.analyze', value: '94 signals processed' },
    { platform: 'finsurfing', action: 'market.surf', value: 'AAPL +2.4% detected' },
    { platform: 'finsurfing', action: 'risk.score', value: '0.12 VaR computed' },
    { platform: 'prompt-eng', action: 'prompt.optimize', value: '38 tokens saved' },
    { platform: 'prompt-eng', action: 'chain.execute', value: '3-step chain done' },
    { platform: 'prompt-eng', action: 'template.render', value: 'v2.1.4 rendered' },
    { platform: 'graphify', action: 'graph.sync', value: '+14 new nodes' },
    { platform: 'graphify', action: 'edge.update', value: '7 weights recalculated' },
    { platform: 'mcp', action: 'tool.invoke', value: 'web_search called' },
    { platform: 'mcp', action: 'context.inject', value: '4.2k tokens compressed' },
    { platform: 'api-brain', action: 'req.complete', value: '28ms p50' },
    { platform: 'kb-core', action: 'knowledge.ingest', value: '1 doc → 23 chunks' },
  ];
  const ev = events[Math.floor(Math.random() * events.length)];
  return {
    id: crypto.randomUUID(),
    time: new Date().toLocaleTimeString('en', { hour12: false }),
    platform: ev.platform,
    action: ev.action,
    value: ev.value,
    color: PLATFORM_COLORS[ev.platform] || '#555',
  };
}

export default function DataFlowTicker({ liveEvents }: { liveEvents?: any[] }) {
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  // Seed with synthetic events
  useEffect(() => {
    const initial = Array.from({ length: 8 }, generateSyntheticEvent).map((e, i) => ({
      ...e,
      time: new Date(Date.now() - (8 - i) * 4000).toLocaleTimeString('en', { hour12: false }),
    }));
    setEvents(initial);

    const interval = setInterval(() => {
      setEvents(prev => [generateSyntheticEvent(), ...prev].slice(0, 60));
    }, 2500 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, []);

  // Inject real SSE events
  useEffect(() => {
    if (!liveEvents || liveEvents.length === 0) return;
    const last = liveEvents[0];
    if (!last) return;
    setEvents(prev => [{
      id: last.id || crypto.randomUUID(),
      time: last.time,
      platform: last.source || 'system',
      action: last.type,
      value: last.message,
      color: PLATFORM_COLORS[last.source] || '#555',
    }, ...prev].slice(0, 60));
  }, [liveEvents]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [events.length]);

  return (
    <div ref={listRef} style={{ maxHeight: '280px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}>
      {events.map((ev, i) => (
        <div
          key={ev.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '58px 90px 120px 1fr',
            gap: '6px',
            padding: '5px 8px',
            borderBottom: '1px solid #0d0d18',
            alignItems: 'center',
            animation: i === 0 ? 'slideIn 0.2s ease' : 'none',
            opacity: Math.max(0.3, 1 - i * 0.015),
          }}
        >
          <span style={{ color: '#333' }}>{ev.time}</span>
          <span style={{ color: ev.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.platform}</span>
          <span style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.action}</span>
          <span style={{ color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.value}</span>
        </div>
      ))}
    </div>
  );
}
