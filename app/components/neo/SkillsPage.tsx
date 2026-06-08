'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { skills } from '@/lib/neo-mock';

const SKILL_ICONS: Record<string, string> = {
  'market-scanner': '🔭', 'symbol-analyzer': '📊', 'advisory-engine': '🎯',
  'social-sentiment': '💬', 'macro-pulse': '🏛️', 'alt-data': '🔍',
  'marketpulse-copilot': '🤖', 'agent-research': '🔬', 'backtest-engine': '⚙️',
  'alert-ai-trigger': '🔔', 'scout-discovery': '🧭', 'prompt-chat': '💬',
  'council': '🏛️', 'optimizer': '✨', 'editor': '📝', 'techniques': '🧠',
};

const TAG_COLORS: Record<string, string> = {
  ai: '#6366f1', scan: '#22d3ee', 'multi-agent': '#a78bfa',
  technical: '#10b981', signals: '#f59e0b', personas: '#ec4899',
  advisory: '#f97316', 'alt-data': '#ff4500', reddit: '#ff4500',
  wsb: '#ff6500', macro: '#22d3ee', fred: '#a78bfa', regime: '#6366f1',
  edgar: '#f97316', finra: '#ec4899', chat: '#10b981', sse: '#22d3ee',
  copilot: '#6366f1', orchestration: '#a78bfa', parallel: '#22d3ee',
  research: '#10b981', backtest: '#6366f1', strategy: '#f59e0b',
  queue: '#22d3ee', alerts: '#ef4444', automation: '#f97316',
  trigger: '#ec4899', generation: '#10b981', scaffold: '#6366f1',
  claude: '#a78bfa', proxy: '#22d3ee', anthropic: '#6366f1',
  council: '#f59e0b', decision: '#10b981', contrarian: '#ef4444',
  optimize: '#6366f1', prompts: '#22d3ee', cot: '#10b981',
};

type FilterSource = 'all' | 'finsurfing' | 'prompt-eng';

export function SkillsPage() {
  const [filter, setFilter] = useState<FilterSource>('all');
  const [platformStatus, setPlatformStatus] = useState<{ finsurfing: boolean; promptEng: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/platform-status')
      .then(r => r.json())
      .then(d => setPlatformStatus({
        finsurfing: d.platforms?.finsurfing?.ok ?? false,
        promptEng: d.platforms?.promptEng?.ok ?? false,
      }))
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? skills : skills.filter(s => s.source === filter);

  const fsCount = skills.filter(s => s.source === 'finsurfing').length;
  const peCount = skills.filter(s => s.source === 'prompt-eng').length;

  return (
    <div className="neo-page-padding">
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>Skills Registry</h1>
          <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>AI capabilities from FinSurfing + PromptForge</p>
        </div>
        {platformStatus && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
              background: platformStatus.finsurfing ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: platformStatus.finsurfing ? '#10b981' : '#ef4444',
              border: `1px solid ${platformStatus.finsurfing ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {platformStatus.finsurfing ? '● FinSurfing live' : '○ FinSurfing down'}
            </span>
            <span style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
              background: platformStatus.promptEng ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: platformStatus.promptEng ? '#10b981' : '#ef4444',
              border: `1px solid ${platformStatus.promptEng ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {platformStatus.promptEng ? '● PromptForge live' : '○ PromptForge down'}
            </span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {([
          ['all', `All Skills (${skills.length})`],
          ['finsurfing', `FinSurfing 🏄 (${fsCount})`],
          ['prompt-eng', `PromptForge 🔮 (${peCount})`],
        ] as [FilterSource, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            style={{
              padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              border: '1px solid',
              cursor: 'pointer',
              background: filter === id ? 'rgba(99,102,241,0.15)' : 'transparent',
              borderColor: filter === id ? 'rgba(99,102,241,0.5)' : 'var(--neo-border)',
              color: filter === id ? '#a5b4fc' : 'var(--neo-muted)',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="neo-card-grid">
        {filtered.map((skill, i) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            style={{
              background: 'var(--neo-surface)',
              border: '1px solid var(--neo-border)',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
            }}
            whileHover={{ borderColor: 'rgba(99,102,241,0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: skill.source === 'finsurfing' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                border: `1px solid ${skill.source === 'finsurfing' ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0,
              }}>{SKILL_ICONS[skill.id] ?? '⚡'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--neo-text)' }}>{skill.name}</span>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '10px',
                    background: skill.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                    color: skill.status === 'active' ? '#10b981' : '#94a3b8',
                  }}>{skill.status}</span>
                </div>
                <code style={{ fontSize: '10px', color: 'var(--neo-muted)', fontFamily: 'monospace' }}>{skill.endpoint}</code>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--neo-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>{skill.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {skill.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '6px',
                  background: (TAG_COLORS[tag] ?? '#6366f1') + '18',
                  color: TAG_COLORS[tag] ?? '#a5b4fc',
                  border: `1px solid ${(TAG_COLORS[tag] ?? '#6366f1')}33`,
                }}>{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--neo-faint)' }}>
                {skill.runs.toLocaleString()} runs
              </span>
              <span style={{
                fontSize: '10px', padding: '2px 7px', borderRadius: '6px',
                background: skill.source === 'finsurfing' ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)',
                color: skill.source === 'finsurfing' ? '#10b981' : '#a5b4fc',
              }}>
                {skill.source === 'finsurfing' ? '🏄 FinSurfing' : '🔮 PromptForge'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
