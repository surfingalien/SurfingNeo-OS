'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme';

interface TickerEvent { id: string; time: string; platform: string; action: string; value: string; }

function generateSyntheticEvent(primary: string, secondary: string, accent: string): TickerEvent {
  const events = [
    { platform: 'finsurfing', action: 'portfolio.analyze', value: '94 signals processed' },
    { platform: 'finsurfing', action: 'market.surf', value: 'AAPL +2.4% detected' },
    { platform: 'finsurfing', action: 'risk.score', value: '0.12 VaR computed' },
    { platform: 'prompt-eng', action: 'prompt.optimize', value: '38 tokens saved' },
    { platform: 'prompt-eng', action: 'chain.execute', value: '3-step chain done' },
    { platform: 'graphify', action: 'graph.sync', value: '+14 new nodes' },
    { platform: 'graphify', action: 'edge.update', value: '7 weights recalculated' },
    { platform: 'mcp', action: 'tool.invoke', value: 'web_search called' },
    { platform: 'api-brain', action: 'req.complete', value: '28ms p50' },
    { platform: 'kb-core', action: 'knowledge.ingest', value: '1 doc → 23 chunks' },
  ];
  return { id: crypto.randomUUID(), time: new Date().toLocaleTimeString('en', { hour12: false }), ...events[Math.floor(Math.random() * events.length)] };
}

export default function DataFlowTicker({ liveEvents }: { liveEvents?: any[] }) {
  const t = useTheme();
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const platformColor = (platform: string) => {
    if (platform === 'finsurfing') return t.accent;
    if (platform === 'prompt-eng') return t.secondary;
    if (platform === 'graphify') return t.primary;
    if (platform === 'mcp') return t.warning;
    return t.success;
  };

  useEffect(() => {
    const initial = Array.from({ length: 8 }, () => generateSyntheticEvent(t.primary, t.secondary, t.accent)).map((e, i) => ({
      ...e, time: new Date(Date.now() - (8 - i) * 4000).toLocaleTimeString('en', { hour12: false }),
    }));
    setEvents(initial);
    const interval = setInterval(() => {
      setEvents(prev => [generateSyntheticEvent(t.primary, t.secondary, t.accent), ...prev].slice(0, 60));
    }, 2500 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!liveEvents?.length) return;
    const last = liveEvents[0];
    if (!last) return;
    setEvents(prev => [{ id: last.id || crypto.randomUUID(), time: last.time, platform: last.source || 'system', action: last.type, value: last.message }, ...prev].slice(0, 60));
  }, [liveEvents]);

  return (
    <div ref={listRef} style={{ maxHeight: '280px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}>
      {events.map((ev, i) => (
        <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '58px 90px 120px 1fr', gap: '6px', padding: '5px 8px', borderBottom: `1px solid ${t.bgDeep}`, alignItems: 'center', animation: i === 0 ? 'slideIn 0.2s ease' : 'none', opacity: Math.max(0.3, 1 - i * 0.015) }}>
          <span style={{ color: t.textFaint }}>{ev.time}</span>
          <span style={{ color: platformColor(ev.platform), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.platform}</span>
          <span style={{ color: t.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.action}</span>
          <span style={{ color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.value}</span>
        </div>
      ))}
    </div>
  );
}
