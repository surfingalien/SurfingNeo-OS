'use client';
import { useEffect, useState } from 'react';
import { LayoutGrid, GitBranch, Server, Zap, Puzzle, Brain, RefreshCw, Clock } from 'lucide-react';

type View = 'dashboard' | 'graphify' | 'mcp' | 'skills' | 'plugins' | 'brain';

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
}

const NAV_ITEMS: { id: View; label: string; badge?: string; badgeColor?: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'graphify', label: 'Graphify', badge: 'LIVE', badgeColor: '#10b981', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'mcp', label: 'MCP Servers', badge: '9', badgeColor: '#6366f1', icon: <Server className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills', badge: '12', badgeColor: '#6366f1', icon: <Zap className="w-4 h-4" /> },
  { id: 'plugins', label: 'Plugins', icon: <Puzzle className="w-4 h-4" /> },
  { id: 'brain', label: 'Agentic Brain', icon: <Brain className="w-4 h-4" /> },
];

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setTime(`${h}:${m}:${s} ${ampm}`);
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function Sidebar({ view, setView }: SidebarProps) {
  const time = useClock();

  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      background: '#0d0d14',
      borderRight: '1px solid var(--neo-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--neo-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--neo-primary), var(--neo-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0,
          }}>
            ⬡
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neo-text)', lineHeight: 1.2 }}>Agentic OS</div>
            <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>FinSurfing v1.0</div>
          </div>
        </div>

        {/* Branch pill + clock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--neo-border)',
            borderRadius: '12px', padding: '3px 8px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--neo-muted)' }}>main</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--neo-muted)' }}>
            <Clock className="w-3 h-3" />
            <span style={{ fontSize: '10px', fontFamily: 'monospace' }}>{time}</span>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search graph nodes, skills, MCPs..."
          style={{
            width: '100%', marginTop: '10px', padding: '7px 10px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)',
            borderRadius: '8px', fontSize: '11px', color: 'var(--neo-text)',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--neo-faint)', padding: '0 8px 8px' }}>
          COMMAND CENTER
        </div>
        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', textAlign: 'left', marginBottom: '2px',
                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: active ? 'var(--neo-text)' : 'var(--neo-muted)',
                borderLeft: active ? '2px solid var(--neo-primary)' : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: active ? 'var(--neo-primary)' : 'var(--neo-faint)' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: '13px', fontWeight: active ? 600 : 400 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                  borderRadius: '10px',
                  background: item.badge === 'LIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.2)',
                  color: item.badge === 'LIVE' ? '#10b981' : '#a5b4fc',
                  border: item.badge === 'LIVE' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(99,102,241,0.3)',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--neo-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>Graph Nodes: <strong style={{ color: 'var(--neo-text)' }}>127</strong></span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#a5b4fc', fontSize: '11px',
          }}>
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>
          Scheduled Jobs: <span style={{ color: '#10b981', fontWeight: 600 }}>7 active</span>
        </div>
      </div>
    </aside>
  );
}
