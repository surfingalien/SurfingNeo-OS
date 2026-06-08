'use client';
import { useEffect, useState } from 'react';
import { LayoutGrid, GitBranch, Server, Zap, Puzzle, Brain, RefreshCw, Clock, ChevronLeft, ChevronRight, X, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'dashboard' | 'graphify' | 'mcp' | 'skills' | 'plugins' | 'brain' | 'data';

interface SidebarProps {
  view: View;
  setView: (v: View) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const NAV_ITEMS: { id: View; label: string; badge?: string; badgeColor?: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'graphify', label: 'Graphify', badge: 'LIVE', badgeColor: '#10b981', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'mcp', label: 'MCP Servers', badge: '12', badgeColor: '#6366f1', icon: <Server className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills', badge: '22', badgeColor: '#6366f1', icon: <Zap className="w-4 h-4" /> },
  { id: 'data', label: 'Data Intelligence', badge: '35+', badgeColor: '#f0b90b', icon: <Database className="w-4 h-4" /> },
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

function SidebarContent({
  view, setView, collapsed, setCollapsed, onClose
}: {
  view: View; setView: (v: View) => void;
  collapsed: boolean; setCollapsed: (v: boolean) => void;
  onClose?: () => void;
}) {
  const time = useClock();

  return (
    <div style={{
      width: collapsed ? '64px' : '280px',
      minWidth: collapsed ? '64px' : '280px',
      background: '#0d0d14',
      borderRight: '1px solid var(--neo-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      transition: 'width 0.2s ease, min-width 0.2s ease',
    }}>
      {/* Header */}
      <div style={{ padding: collapsed ? '16px 0' : '20px 16px 12px', borderBottom: '1px solid var(--neo-border)', display: 'flex', flexDirection: 'column', alignItems: collapsed ? 'center' : 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '10px', justifyContent: collapsed ? 'center' : 'space-between' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--neo-primary), var(--neo-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0,
          }}>
            ⬡
          </div>
          {!collapsed && (
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--neo-text)', lineHeight: 1.2 }}>Agentic OS</div>
              <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>SurfingNeo v1.0</div>
            </div>
          )}
          {/* Close button on mobile overlay */}
          {onClose && !collapsed && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neo-muted)', padding: '4px' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!collapsed && (
          <>
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

            <input
              type="text"
              placeholder="Search nodes, skills, MCPs..."
              style={{
                width: '100%', marginTop: '10px', padding: '7px 10px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)',
                borderRadius: '8px', fontSize: '11px', color: 'var(--neo-text)',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 0' : '12px 8px', overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--neo-faint)', padding: '0 8px 8px' }}>
            COMMAND CENTER
          </div>
        )}
        {NAV_ITEMS.map(item => {
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setView(item.id); onClose?.(); }}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : '10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '10px 0' : '9px 10px',
                borderRadius: collapsed ? '0' : '8px',
                border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: '2px',
                background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: active ? 'var(--neo-text)' : 'var(--neo-muted)',
                borderLeft: active ? `2px solid var(--neo-primary)` : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: active ? 'var(--neo-primary)' : 'var(--neo-faint)', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <>
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
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer + collapse toggle */}
      <div style={{ padding: collapsed ? '12px 0' : '12px 16px', borderTop: '1px solid var(--neo-border)' }}>
        {!collapsed && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>Graph Nodes: <strong style={{ color: 'var(--neo-text)' }}>2,847</strong></span>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', color: '#a5b4fc', fontSize: '11px',
              }}>
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--neo-muted)' }}>
              Cron Jobs: <span style={{ color: '#10b981', fontWeight: 600 }}>7 active</span>
            </div>
          </div>
        )}
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-collapse-btn"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '6px', borderRadius: '8px', border: '1px solid var(--neo-border)',
            background: 'rgba(255,255,255,0.03)', cursor: 'pointer', color: 'var(--neo-muted)',
          }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span style={{ fontSize: '11px', marginLeft: '6px' }}>Collapse</span>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ view, setView, collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ height: '100vh', position: 'sticky', top: 0 }}>
        <SidebarContent view={view} setView={setView} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                zIndex: 100, backdropFilter: 'blur(2px)',
              }}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{ position: 'fixed', left: 0, top: 0, height: '100vh', zIndex: 101 }}
            >
              <SidebarContent
                view={view} setView={setView}
                collapsed={false} setCollapsed={setCollapsed}
                onClose={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
