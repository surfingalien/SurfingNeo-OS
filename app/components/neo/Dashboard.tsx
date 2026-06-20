'use client';
import { useEffect, useState, useCallback } from 'react';
import { Header } from './Header';
import { Panel } from './Panel';
import { ForceGraph } from './ForceGraph';
import { NodeDetail } from './NodeDetail';
import { PlatformMesh } from './PlatformMesh';
import { TrajectoryChart } from './TrajectoryChart';
import { DataFlow } from './DataFlow';
import { BrainHealth } from './BrainHealth';
import { EventStream } from './EventStream';
import { SystemStatus } from './SystemStatus';
import { Sidebar } from './Sidebar';
import { MCPServersPage } from './MCPServersPage';
import { SkillsPage } from './SkillsPage';
import { PluginsPage } from './PluginsPage';
import { AgenticBrainPage } from './AgenticBrainPage';
import { CodeAnalysisPanel } from './CodeAnalysisPanel';
import { StatsBar } from './StatsBar';
import { type Theme, type GraphNode } from '@/lib/neo-mock';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Radio, Cpu, Menu } from 'lucide-react';

type Tab = 'topology' | 'platforms' | 'trajectory';
type View = 'dashboard' | 'graphify' | 'mcp' | 'skills' | 'plugins' | 'brain' | 'code-analysis';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'topology', label: 'Topology', emoji: '🔗' },
  { id: 'platforms', label: 'Platforms', emoji: '🌊' },
  { id: 'trajectory', label: 'Trajectory', emoji: '📈' },
];

function DashboardContent({ theme, setTheme, onMenuOpen }: { theme: Theme; setTheme: (t: Theme) => void; onMenuOpen: () => void }) {
  const [tab, setTab] = useState<Tab>('topology');
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setLastUpdated(new Date()); }, 900);
  };

  const handleSelect = useCallback((n: GraphNode | null) => setSelected(n), []);

  return (
    <>
      <Header theme={theme} setTheme={setTheme} onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} onMenuOpen={onMenuOpen} />
      <StatsBar />
      <main className="neo-dashboard-grid px-4 md:px-6 py-5 gap-5">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
          <Panel>
            <div className="flex border-b px-2 pt-2 gap-1" style={{ borderColor: 'var(--neo-border)' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }}
                  className="relative px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  style={{ color: tab === t.id ? 'var(--neo-text)' : 'var(--neo-muted)' }}>
                  <span>{t.emoji}</span>{t.label}
                  {tab === t.id && (
                    <motion.div layoutId="tab-ul" className="absolute bottom-0 left-0 right-0 h-0.5"
                      style={{ background: 'linear-gradient(to right, var(--neo-primary), var(--neo-secondary))' }} />
                  )}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
                {tab === 'topology' && <ForceGraph onSelect={handleSelect} selectedId={selected?.id ?? null} />}
                {tab === 'platforms' && <PlatformMesh />}
                {tab === 'trajectory' && <TrajectoryChart />}
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              {tab === 'topology' && selected && <NodeDetail node={selected} onClose={() => setSelected(null)} />}
            </AnimatePresence>
          </Panel>

          <Panel title="Live Data Flow" icon={<Zap className="w-3 h-3" />}
            action={<span className="text-[10px] font-mono" style={{ color: 'var(--neo-muted)' }}>stream · 1s</span>}>
            <DataFlow />
          </Panel>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Panel title="Brain Health" icon={<Brain className="w-3 h-3" />}><BrainHealth /></Panel>
          <Panel title="Event Stream" icon={<Radio className="w-3 h-3" />}><EventStream /></Panel>
          <Panel title="System Status" icon={<Cpu className="w-3 h-3" />}><SystemStatus /></Panel>
        </div>
      </main>

      <footer className="px-4 md:px-6 py-3 border-t mt-4 flex flex-col sm:flex-row justify-between gap-1"
        style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--neo-faint)', borderColor: 'var(--neo-border)' }}>
        <span>SurfingNeo-OS v1.0.0 · Neural Mesh Control Center</span>
        <span>real-time AI operations · us-east-1</span>
      </footer>
    </>
  );
}

function GraphifyView({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [tab, setTab] = useState<Tab>('topology');
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [rateIn, setRateIn] = useState(0);
  const [rateOut, setRateOut] = useState(0);
  const handleSelect = useCallback((n: GraphNode | null) => setSelected(n), []);
  const handleRate = useCallback((ri: number, ro: number) => { setRateIn(ri); setRateOut(ro); }, []);

  return (
    <div className="neo-page-padding">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>Graphify</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>Live knowledge graph topology</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--neo-muted)', padding: '4px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--neo-border)' }}>
            ↓ {rateIn}/s · ↑ {rateOut}/s
          </span>
          <span style={{
            fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px',
            background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            LIVE
          </span>
        </div>
      </div>
      <Panel>
        <div className="flex border-b px-2 pt-2 gap-1" style={{ borderColor: 'var(--neo-border)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); }}
              className="relative px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 transition-colors"
              style={{ color: tab === t.id ? 'var(--neo-text)' : 'var(--neo-muted)' }}>
              <span>{t.emoji}</span>{t.label}
              {tab === t.id && (
                <motion.div layoutId="graphify-tab-ul" className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'linear-gradient(to right, var(--neo-primary), var(--neo-secondary))' }} />
              )}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.22 }}>
            {tab === 'topology' && <ForceGraph onSelect={handleSelect} selectedId={selected?.id ?? null} />}
            {tab === 'platforms' && <PlatformMesh />}
            {tab === 'trajectory' && <TrajectoryChart />}
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {tab === 'topology' && selected && <NodeDetail node={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
      </Panel>
      <div style={{ marginTop: '16px' }}>
        <Panel title="Live Data Flow" icon={<Zap className="w-3 h-3" />}
          action={<span className="text-[10px] font-mono" style={{ color: 'var(--neo-muted)' }}>↓ {rateIn}/s · ↑ {rateOut}/s</span>}>
          <DataFlow onRate={handleRate} />
        </Panel>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [theme, setTheme] = useState<Theme>('neural');
  const [view, setView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--neo-bg)' }}>
      <Sidebar
        view={view} setView={setView}
        collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
      />
      <div style={{ flex: 1, overflow: 'auto', color: 'var(--neo-text)', minWidth: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {view === 'dashboard' && <DashboardContent theme={theme} setTheme={setTheme} onMenuOpen={() => setMobileOpen(true)} />}
            {view === 'graphify' && <GraphifyView onMenuOpen={() => setMobileOpen(true)} />}
            {view === 'mcp' && <MCPServersPage />}
            {view === 'skills' && <SkillsPage />}
            {view === 'plugins' && <PluginsPage />}
            {view === 'brain' && <AgenticBrainPage />}
            {view === 'code-analysis' && <CodeAnalysisPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
