'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../theme';

interface DataPoint {
  date: string;
  knowledgeNodes: number;
  apiRequests: number;
  insights: number;
  brainScore: number;
}

type Metric = 'knowledgeNodes' | 'apiRequests' | 'brainScore' | 'insights';

export default function ImprovementChart({ data }: { data: DataPoint[] }) {
  const t = useTheme();
  const METRICS: { key: Metric; label: string; color: string }[] = [
    { key: 'brainScore', label: 'Brain Score', color: t.success },
    { key: 'knowledgeNodes', label: 'KB Nodes', color: t.secondary },
    { key: 'apiRequests', label: 'API Requests', color: t.accent },
    { key: 'insights', label: 'Insights', color: t.primary },
  ];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeMetrics, setActiveMetrics] = useState<Set<Metric>>(new Set<Metric>(['brainScore', 'knowledgeNodes', 'apiRequests']));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const hoverIdxRef = useRef<number | null>(null);

  function toggleMetric(key: Metric) {
    setActiveMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); }
      else next.add(key);
      return next;
    });
  }

  useEffect(() => {
    hoverIdxRef.current = hoverIdx;
  }, [hoverIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const ro = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      render();
    });
    ro.observe(canvas);

    function render() {
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      const pad = { top: 16, right: 16, bottom: 28, left: 44 };
      const cw = w - pad.left - pad.right;
      const ch = h - pad.top - pad.bottom;

      ctx!.clearRect(0, 0, w * dpr, h * dpr);

      // Grid
      ctx!.strokeStyle = t.border;
      ctx!.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (ch / 4) * i;
        ctx!.beginPath();
        ctx!.moveTo(pad.left, y);
        ctx!.lineTo(w - pad.right, y);
        ctx!.stroke();
      }

      const active = METRICS.filter(m => activeMetrics.has(m.key));

      for (const metric of active) {
        const values = data.map(d => d[metric.key]);
        const max = Math.max(...values) * 1.05;
        const min = Math.min(...values) * 0.95;
        const range = max - min || 1;

        const toY = (v: number) => pad.top + ch - ((v - min) / range) * ch;
        const toX = (i: number) => pad.left + (i / (data.length - 1)) * cw;

        // Fill
        ctx!.beginPath();
        ctx!.fillStyle = metric.color + '12';
        data.forEach((d, i) => {
          const x = toX(i), y = toY(d[metric.key]);
          if (i === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y);
        });
        ctx!.lineTo(toX(data.length - 1), pad.top + ch);
        ctx!.lineTo(pad.left, pad.top + ch);
        ctx!.closePath();
        ctx!.fill();

        // Line
        ctx!.beginPath();
        ctx!.strokeStyle = metric.color;
        ctx!.lineWidth = 1.5;
        ctx!.lineJoin = 'round';
        data.forEach((d, i) => {
          const x = toX(i), y = toY(d[metric.key]);
          if (i === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y);
        });
        ctx!.stroke();

        // Hover dot
        const hi = hoverIdxRef.current;
        if (hi !== null && hi >= 0 && hi < data.length) {
          ctx!.beginPath();
          ctx!.arc(toX(hi), toY(data[hi][metric.key]), 4, 0, Math.PI * 2);
          ctx!.fillStyle = metric.color;
          ctx!.fill();
        }
      }

      // X axis labels
      ctx!.fillStyle = t.textFaint;
      ctx!.font = '9px system-ui';
      ctx!.textAlign = 'center';
      data.forEach((d, i) => {
        if (i % 7 === 0 || i === data.length - 1) {
          ctx!.fillText(d.date.slice(5), pad.left + (i / (data.length - 1)) * cw, h - 8);
        }
      });

      // Hover tooltip
      const hi = hoverIdxRef.current;
      if (hi !== null && hi >= 0 && hi < data.length) {
        const x = pad.left + (hi / (data.length - 1)) * cw;
        ctx!.strokeStyle = t.borderStrong;
        ctx!.lineWidth = 1;
        ctx!.setLineDash([3, 3]);
        ctx!.beginPath();
        ctx!.moveTo(x, pad.top);
        ctx!.lineTo(x, pad.top + ch);
        ctx!.stroke();
        ctx!.setLineDash([]);

        const d = data[hi];
        const tipW = 130, tipH = active.length * 16 + 24;
        const tipX = Math.min(x + 8, w - tipW - pad.right);
        const tipY = pad.top;
        ctx!.fillStyle = t.panel + 'ee';
        ctx!.strokeStyle = t.borderStrong;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.roundRect(tipX, tipY, tipW, tipH, 4);
        ctx!.fill();
        ctx!.stroke();

        ctx!.font = 'bold 9px system-ui';
        ctx!.fillStyle = t.textMuted;
        ctx!.textAlign = 'left';
        ctx!.fillText(d.date, tipX + 8, tipY + 13);

        active.forEach((m, i) => {
          const val = d[m.key];
          ctx!.font = '9px system-ui';
          ctx!.fillStyle = m.color;
          ctx!.fillText(`${m.label}: ${typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 1 }) : val}`, tipX + 8, tipY + 24 + i * 16);
        });
      }
    }

    render();

    // Mouse hover
    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const pad = { left: 44, right: 16 };
      const cw = rect.width - pad.left - pad.right;
      const mx = e.clientX - rect.left - pad.left;
      const idx = Math.round((mx / cw) * (data.length - 1));
      const clamped = Math.max(0, Math.min(data.length - 1, idx));
      if (hoverIdxRef.current !== clamped) {
        setHoverIdx(clamped);
        hoverIdxRef.current = clamped;
        render();
      }
    }
    function onMouseLeave() {
      setHoverIdx(null);
      hoverIdxRef.current = null;
      render();
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    return () => {
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [data, activeMetrics]);

  return (
    <div>
      {/* Legend / Toggle */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => toggleMetric(m.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', padding: '3px 8px', borderRadius: '12px',
              background: activeMetrics.has(m.key) ? `${m.color}18` : 'transparent',
              border: `1px solid ${activeMetrics.has(m.key) ? m.color + '44' : '#1a1a2e'}`,
              transition: 'all 0.2s',
            } as React.CSSProperties}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeMetrics.has(m.key) ? m.color : '#333', display: 'inline-block' }} />
            <span style={{ fontSize: '10px', color: activeMetrics.has(m.key) ? m.color : '#444' }}>{m.label}</span>
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '200px', cursor: 'crosshair' }} />
    </div>
  );
}
