'use client';

import { useEffect, useRef } from 'react';

export default function ImprovementChart({ data }: { data: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    // Find ranges
    const maxNodes = Math.max(...data.map(d => d.knowledgeNodes));
    const maxRequests = Math.max(...data.map(d => d.apiRequests));
    const maxScore = Math.max(...data.map(d => d.brainScore));

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
    }

    // Draw lines
    function drawLine(values: number[], color: string, max: number, label: string) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      values.forEach((v, i) => {
        const x = padding.left + (i / (values.length - 1)) * chartW;
        const y = padding.top + chartH - (v / max) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Fill area
      ctx.beginPath();
      ctx.fillStyle = color + '15';
      values.forEach((v, i) => {
        const x = padding.left + (i / (values.length - 1)) * chartW;
        const y = padding.top + chartH - (v / max) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(padding.left + chartW, padding.top + chartH);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.closePath();
      ctx.fill();
    }

    drawLine(data.map(d => d.knowledgeNodes), '#00ff88', maxNodes, 'Nodes');
    drawLine(data.map(d => d.apiRequests), '#00ccff', maxRequests, 'Requests');
    drawLine(data.map(d => d.brainScore * 30), '#ffaa00', maxScore * 30, 'Score');

    // X axis labels (every 5 days)
    ctx.fillStyle = '#444';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      if (i % 5 === 0 || i === data.length - 1) {
        const x = padding.left + (i / (data.length - 1)) * chartW;
        ctx.fillText(d.date.slice(5), x, h - 8);
      }
    });

    // Legend
    const legend = [
      { label: 'Knowledge Nodes', color: '#00ff88' },
      { label: 'API Requests', color: '#00ccff' },
      { label: 'Brain Score', color: '#ffaa00' },
    ];
    legend.forEach((item, i) => {
      const x = padding.left + i * 100;
      const y = 12;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.fillStyle = '#666';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 10, y + 3);
    });

  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '200px' }}
    />
  );
}