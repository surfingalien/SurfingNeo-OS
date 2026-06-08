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
import { type Theme, type GraphNode } from '@/lib/neo-mock';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Brain, Radio, Cpu } from 'lucide-react';

type Tab = 'topology' | 'platforms' | 'trajectory';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'topology', label: 'Topology', emoji: '🔗' },
  { id: 'platforms', label: 'Platforms', emoji: '🌊' },
  { id: 'trajectory', label: 'Trajectory', emoji: '📈' },
];

export function Dashboard() {
  const [theme, setTheme] = useState<Theme>('neural');
  const [tab, setTab] = useState<Tab>('topology');
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setLastUpdated(new Date()); }, 900);
  };

  const handleSelect = useCallback((n: GraphNode | null) => setSelected(n), []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--neo-bg)', color: 'var(--neo-text)' }}>
      <Header theme={theme} setTheme={setTheme} onRefresh={refresh} refreshing={refreshing} lastUpdated={lastUpdated} />

      <main className="px-6 py-5 grid gap-5" style={{ gridTemplateColumns: '1fr 380px' }}>
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
            action={<span className="text-[10px] font-mono" style={{ color: 'var(--neo-muted)' }}>stream · 1.4s</span>}>
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

      <footer className="px-6 py-4 border-t mt-4 flex justify-between"
        style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--neo-faint)', borderColor: 'var(--neo-border)' }}>
        <span>SurfingNeo-OS v1.0.0 · Neural Mesh Control Center</span>
        <span>real-time AI operations · us-east-1</span>
      </footer>
    </div>
  );
}
