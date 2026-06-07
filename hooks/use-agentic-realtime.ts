'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAgenticRealtime(projectId: string) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [circuitStatus, setCircuitStatus] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const url = new URL('/api/stream', window.location.origin);
    url.searchParams.set('projectId', projectId);

    const eventSource = new EventSource(url.toString());

    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = () => setConnected(false);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'connected') {
        console.log('SSE connected:', data.clientId);
      } else {
        setEvents(prev => [...prev.slice(-100), data]);

        if (data.circuitState) {
          setCircuitStatus(data.circuitState);
        }
      }
    };

    return () => eventSource.close();
  }, [projectId]);

  const queryGraphify = useCallback(async (query: string) => {
    const res = await fetch('/api/graphify/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ projectId, query }),
    });
    return res.json();
  }, [projectId]);

  const invokeMCP = useCallback(async (toolName: string, args: any) => {
    const res = await fetch('/api/mcp/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
      body: JSON.stringify({ toolName, arguments: args, serverName: 'agentic-os' }),
    });
    return res.json();
  }, []);

  return { connected, events, circuitStatus, queryGraphify, invokeMCP };
}