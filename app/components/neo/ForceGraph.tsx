'use client';
import { useEffect, useRef, useState } from 'react';
import { graph, type GraphNode, type GraphLink } from '@/lib/neo-mock';

const TYPE_COLOR: Record<GraphNode['type'], string> = {
  core: '#6366f1', brain: '#22d3ee', platform: '#10b981', site: '#f59e0b', memory: '#a78bfa',
};
const TYPE_EMOJI: Record<GraphNode['type'], string> = {
  core: '⚡', brain: '🧠', platform: '⚙️', site: '🌐', memory: '🔲',
};
const STATUS_RING: Record<GraphNode['status'], string> = {
  healthy: '#10b981', degraded: '#f59e0b', offline: '#ef4444',
};

type LiveNode = GraphNode & { x: number; y: number; vx: number; vy: number };

export function ForceGraph({ onSelect, selectedId }: { onSelect: (n: GraphNode | null) => void; selectedId: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');
  const linksRef = useRef<GraphLink[]>(graph.links);
  const stateRef = useRef({
    nodes: graph.nodes.map((n, i) => ({
      ...n,
      x: 400 + Math.cos((i / graph.nodes.length) * Math.PI * 2) * 180,
      y: 220 + Math.sin((i / graph.nodes.length) * Math.PI * 2) * 140,
      vx: 0, vy: 0,
    })) as LiveNode[],
    drag: null as null | { id: string; offX: number; offY: number },
    zoom: 1, panX: 0, panY: 0, w: 800, h: 460,
  });

  // Poll /api/graph every 5s to update node statuses + link strengths
  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch('/api/graph', { next: { revalidate: 0 } });
        if (!res.ok) return;
        const data = await res.json();
        if (data.nodes?.length) {
          stateRef.current.nodes = stateRef.current.nodes.map(existing => {
            const updated = data.nodes.find((n: GraphNode) => n.id === existing.id);
            return updated ? { ...existing, status: updated.status, size: updated.size ?? existing.size } : existing;
          });
          setSource(data.source === 'graphify-live' ? 'live' : 'fallback');
        }
        if (data.links?.length) linksRef.current = data.links;
      } catch { /* keep existing data */ }
    };
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const c = canvasRef.current!, ctx = c.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    let raf = 0;
    const resize = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      stateRef.current.w = r.width; stateRef.current.h = r.height;
      c.width = r.width * dpr; c.height = r.height * dpr;
      c.style.width = `${r.width}px`; c.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrapRef.current!);

    const tick = () => {
      const s = stateRef.current, nodes = s.nodes;
      for (const n of nodes) {
        if (s.drag?.id === n.id) continue;
        n.vx += (s.w / 2 - n.x) * 0.0008; n.vy += (s.h / 2 - n.y) * 0.0008;
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 0.01;
        const f = 1800 / d2, d = Math.sqrt(d2), fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
      }
      for (const l of linksRef.current) {
        const a = nodes.find(n => n.id === l.source)!, b = nodes.find(n => n.id === l.target)!;
        if (!a || !b) continue;
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 140) * 0.01 * l.strength, fx = (dx / d) * f, fy = (dy / d) * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
      for (const n of nodes) {
        if (s.drag?.id === n.id) continue;
        n.vx *= 0.85; n.vy *= 0.85; n.x += n.vx; n.y += n.vy;
      }
      ctx.clearRect(0, 0, s.w, s.h);
      ctx.save();
      ctx.translate(s.panX, s.panY); ctx.scale(s.zoom, s.zoom);
      ctx.strokeStyle = 'rgba(99,102,241,0.05)'; ctx.lineWidth = 1;
      for (let x = 0; x < s.w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s.h); ctx.stroke(); }
      for (let y = 0; y < s.h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s.w, y); ctx.stroke(); }
      // Compute node degrees for god-node detection (Graphify pattern)
      const links = linksRef.current;
      const maxTraffic = Math.max(...links.map(l => l.traffic ?? 1), 1);
      const degree: Record<string, number> = {};
      for (const l of links) {
        degree[l.source] = (degree[l.source] ?? 0) + 1;
        degree[l.target] = (degree[l.target] ?? 0) + 1;
      }
      // BFS shortest path from selectedId to hover (Graphify path-highlight pattern)
      const pathEdges = new Set<string>();
      if (selectedId && hover && selectedId !== hover) {
        const adj: Record<string, string[]> = {};
        for (const l of links) {
          (adj[l.source] ??= []).push(l.target);
          (adj[l.target] ??= []).push(l.source);
        }
        const prev: Record<string, string> = {};
        const q = [selectedId];
        const visited = new Set([selectedId]);
        outer: while (q.length) {
          const cur = q.shift()!;
          for (const nb of (adj[cur] ?? [])) {
            if (!visited.has(nb)) { visited.add(nb); prev[nb] = cur; q.push(nb); if (nb === hover) break outer; }
          }
        }
        let cur = hover;
        while (prev[cur]) { pathEdges.add(`${prev[cur]}-${cur}`); pathEdges.add(`${cur}-${prev[cur]}`); cur = prev[cur]; }
      }
      for (const l of links) {
        const a = nodes.find(n => n.id === l.source)!, b = nodes.find(n => n.id === l.target)!;
        if (!a || !b) continue;
        const high = hover != null && (l.source === hover || l.target === hover);
        const onPath = pathEdges.has(`${l.source}-${l.target}`);
        // Edge type classification (Graphify EXTRACTED/INFERRED/AMBIGUOUS pattern)
        const edgeType = l.strength >= 0.85 ? 'EXTRACTED' : l.strength >= 0.65 ? 'INFERRED' : 'AMBIGUOUS';
        ctx.setLineDash(edgeType === 'EXTRACTED' ? [] : edgeType === 'INFERRED' ? [6, 3] : [2, 4]);
        ctx.strokeStyle = onPath ? 'rgba(34,211,238,0.9)' : high ? 'rgba(99,102,241,0.8)'
          : edgeType === 'EXTRACTED' ? 'rgba(148,163,184,0.35)'
          : edgeType === 'INFERRED' ? 'rgba(148,163,184,0.20)'
          : 'rgba(148,163,184,0.10)';
        ctx.lineWidth = onPath ? 2 : high ? 1.5 : 0.6 + l.strength * 0.6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.setLineDash([]);
        // Traffic-based multi-particle flow: higher traffic = more particles per edge
        const particleCount = 1 + Math.round(((l.traffic ?? 0) / maxTraffic) * 3);
        const speed = 0.15 + l.strength * 0.25;
        for (let p = 0; p < particleCount; p++) {
          const offset = p / particleCount;
          const t = ((Date.now() / 1000) * speed + offset) % 1;
          const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
          ctx.fillStyle = onPath ? '#22d3ee' : high ? '#22d3ee' : 'rgba(99,102,241,0.6)';
          ctx.beginPath(); ctx.arc(px, py, onPath ? 3 : high ? 2.5 : 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      for (const n of nodes) {
        const isGodNode = (degree[n.id] ?? 0) >= 3;
        const r = 12 + Math.log10(n.size + 1) * 3 + (isGodNode ? 3 : 0);
        const isHover = hover === n.id, isSel = selectedId === n.id;
        if (isHover || isSel) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
          g.addColorStop(0, TYPE_COLOR[n.type] + '80'); g.addColorStop(1, 'transparent');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2); ctx.fill();
        }
        // God node extra outer glow ring (Graphify pattern)
        if (isGodNode) {
          ctx.strokeStyle = TYPE_COLOR[n.type] + '55';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(n.x, n.y, r + 6, 0, Math.PI * 2); ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.fillStyle = TYPE_COLOR[n.type];
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = STATUS_RING[n.status]; ctx.lineWidth = isSel ? 3 : 1.5; ctx.stroke();
        // emoji icon centred inside node
        const emojiSize = Math.round(r * 1.1);
        ctx.font = `${emojiSize}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(TYPE_EMOJI[n.type], n.x, n.y);
        // label below
        ctx.fillStyle = '#f1f5f9'; ctx.font = '11px Inter, sans-serif';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(n.label, n.x, n.y + r + 14);
      }
      ctx.restore();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const getPos = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left - stateRef.current.panX) / stateRef.current.zoom, y: (e.clientY - r.top - stateRef.current.panY) / stateRef.current.zoom };
    };
    const hit = (p: { x: number; y: number }) => {
      for (const n of stateRef.current.nodes) {
        const r = 12 + Math.log10(n.size + 1) * 3;
        if ((n.x - p.x) ** 2 + (n.y - p.y) ** 2 <= r * r) return n;
      }
      return null;
    };
    const onMove = (e: MouseEvent) => {
      const p = getPos(e);
      if (stateRef.current.drag) {
        const n = stateRef.current.nodes.find(n => n.id === stateRef.current.drag!.id)!;
        n.x = p.x - stateRef.current.drag.offX; n.y = p.y - stateRef.current.drag.offY; n.vx = n.vy = 0;
      } else { const n = hit(p); setHover(n?.id ?? null); c.style.cursor = n ? 'pointer' : 'default'; }
    };
    const onDown = (e: MouseEvent) => {
      const p = getPos(e), n = hit(p);
      if (n) stateRef.current.drag = { id: n.id, offX: p.x - n.x, offY: p.y - n.y };
    };
    const onUp = (e: MouseEvent) => {
      const wasDrag = stateRef.current.drag; stateRef.current.drag = null;
      const p = getPos(e), n = hit(p);
      if (n) onSelect(n); else if (!wasDrag) onSelect(null);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stateRef.current.zoom = Math.max(0.5, Math.min(3, stateRef.current.zoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    };
    c.addEventListener('mousemove', onMove); c.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp); c.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      c.removeEventListener('mousemove', onMove); c.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp); c.removeEventListener('wheel', onWheel);
    };
  }, [hover, selectedId, onSelect]);

  return (
    <div ref={wrapRef} className="relative w-full h-[460px]" style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08), transparent 70%)' }}>
      <canvas ref={canvasRef} />
      <div className="absolute top-3 left-3 flex gap-3 text-[10px]" style={{ color: 'var(--neo-muted)' }}>
        {Object.entries(TYPE_COLOR).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: v }} />
            <span className="uppercase tracking-wider">{k}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-3 flex gap-3 text-[10px]" style={{ color: 'var(--neo-muted)' }}>
        <div className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '16px', height: '1px', background: 'rgba(148,163,184,0.6)' }} /><span>extracted</span></div>
        <div className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '16px', height: '1px', borderTop: '1px dashed rgba(148,163,184,0.5)' }} /><span>inferred</span></div>
        <div className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '16px', height: '1px', borderTop: '1px dotted rgba(148,163,184,0.4)' }} /><span>ambiguous</span></div>
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-3 text-[10px] font-mono" style={{ color: 'var(--neo-faint)' }}>
        <span style={{ color: source === 'live' ? '#10b981' : 'var(--neo-faint)' }}>
          {source === 'live' ? '● live' : '○ fallback'}
        </span>
        <span>scroll · zoom · drag · click</span>
      </div>
    </div>
  );
}
