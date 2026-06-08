'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Activity, Menu } from 'lucide-react';
import { THEMES, type Theme } from '@/lib/neo-mock';
import { motion, AnimatePresence } from 'framer-motion';

function StatusPill({ name, ok }: { name: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full neo-glass text-xs font-medium">
      <span className="relative w-2 h-2 inline-block">
        <span className={`absolute inset-0 rounded-full ${ok ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        <span className={`absolute inset-0 rounded-full neo-pulse-dot ${ok ? 'text-emerald-400' : 'text-rose-400'}`} />
      </span>
      <span style={{ color: 'var(--neo-text)' }}>{name}</span>
      <span style={{ color: 'var(--neo-muted)', fontFamily: 'monospace', fontSize: '10px' }}>{ok ? 'OK' : 'DEG'}</span>
    </div>
  );
}

export function Header({ theme, setTheme, onRefresh, refreshing, lastUpdated, onMenuOpen }: {
  theme: Theme; setTheme: (t: Theme) => void; onRefresh: () => void; refreshing: boolean; lastUpdated: Date; onMenuOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(i); }, []);
  const sec = Math.max(0, Math.floor((now - lastUpdated.getTime()) / 1000));
  const current = THEMES.find(t => t.id === theme)!;

  return (
    <header className="sticky top-0 z-40 h-14 neo-gradient-border backdrop-blur-md border-b" style={{ background: 'rgba(8,9,13,0.85)', borderColor: 'var(--neo-border)' }}>
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onMenuOpen && (
            <button onClick={onMenuOpen} className="sidebar-mobile-btn md:hidden w-8 h-8 flex items-center justify-center rounded-md border" style={{ borderColor: 'var(--neo-border)', color: 'var(--neo-muted)', background: 'none', cursor: 'pointer' }}>
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--neo-primary), var(--neo-secondary))' }}>
            <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
            <span className="absolute -inset-1 rounded-lg opacity-30 blur animate-pulse" style={{ background: 'var(--neo-primary)' }} />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--neo-text)' }}>SurfingNeo-OS</div>
            <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--neo-muted)' }}>Neural Mesh Control Center</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <StatusPill name="Graphify" ok />
          <StatusPill name="MCP" ok />
          <StatusPill name="SSE" ok />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-mono" style={{ color: 'var(--neo-muted)' }}>updated {sec}s ago</div>
          <button onClick={onRefresh} className="w-8 h-8 rounded-md border flex items-center justify-center transition-colors hover:opacity-80" style={{ borderColor: 'var(--neo-border)', color: 'var(--neo-muted)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'neo-spin' : ''}`} />
          </button>
          <div className="relative">
            <button onClick={() => setOpen(o => !o)} className="h-8 px-3 rounded-md border text-xs flex items-center gap-2 transition-colors" style={{ borderColor: 'var(--neo-border)', color: 'var(--neo-text)' }}>
              <span>{current.emoji}</span><span>{current.name}</span>
            </button>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 mt-2 w-44 rounded-lg neo-glass shadow-xl overflow-hidden z-50">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => { setTheme(t.id); setOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-white/5"
                      style={{ color: t.id === theme ? 'var(--neo-primary)' : 'var(--neo-muted)' }}>
                      <span className="flex items-center gap-2"><span>{t.emoji}</span>{t.name}</span>
                      {t.id === theme && <span>✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
