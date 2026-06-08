'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { skills } from '@/lib/neo-mock';

const TAG_COLORS: Record<string, string> = {
  ai: '#6366f1', scan: '#22d3ee', 'multi-agent': '#a78bfa',
  technical: '#10b981', signals: '#f59e0b', personas: '#ec4899',
  advisory: '#f97316', 'alt-data': '#ff4500', reddit: '#ff4500',
  wsb: '#ff6500', risk: '#ef4444', portfolio: '#f59e0b',
  earnings: '#10b981', catalyst: '#22d3ee', llm: '#6366f1',
  tokens: '#a78bfa', optimization: '#10b981', chain: '#6366f1',
  pipeline: '#22d3ee', templates: '#f59e0b', render: '#10b981',
  eval: '#ef4444', benchmark: '#f59e0b', quality: '#22d3ee',
  context: '#6366f1', compression: '#a78bfa', rag: '#10b981',
  retrieval: '#22d3ee', graphify: '#a78bfa',
};

type FilterSource = 'all' | 'finsurfing' | 'prompt-eng';

export function SkillsPage() {
  const [filter, setFilter] = useState<FilterSource>('all');

  const filtered = filter === 'all' ? skills : skills.filter(s => s.source === filter);

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)', margin: 0 }}>FinSurfing Skills</h1>
        <p style={{ fontSize: '13px', color: 'var(--neo-muted)', marginTop: '4px' }}>AI capabilities registered in the system</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {([['all', 'All Skills'], ['finsurfing', 'FinSurfing 🏄'], ['prompt-eng', 'Prompt-Eng 🔮']] as [FilterSource, string][]).map(([id, label]) => (
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', flexShrink: 0,
              }}>⚡</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
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
            <div style={{ fontSize: '11px', color: 'var(--neo-faint)' }}>
              {skill.runs.toLocaleString()} runs
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
