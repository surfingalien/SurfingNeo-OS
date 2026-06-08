'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Node {
  id: string;
  label: string;
  type: string;
  status: string;
  edges: number;
  size: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
  type: string;
  traffic: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
  source?: string;
  warning?: string;
}

interface SimNode extends Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  pulsePhase: number;
}

interface SimLink extends Link {
  sourceNode: SimNode;
  targetNode: SimNode;
  particleOffset: number;
}

const TYPE_COLORS: Record<string, string> = {
  brain: '#00ff88',
  engine: '#00ccff',
  interface: '#ffaa00',
  infrastructure: '#cc88ff',
  source: '#ff6688',
  storage: '#88ccff',
  platform: '#ff9944',
};

const TYPE_ICONS: Record<string, string> = {
  brain: '🧠', engine: '⚙️', interface: '🔌', infrastructure: '🏗️', source: '📡', storage: '💾', platform: '🌊',
};

export default function ForceGraph({ data, onNodeClick }: { data: GraphData; onNodeClick?: (node: Node | null) => void }) {
  if (!data?.nodes?.length) return <div style={{ height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>No graph data available</div>;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const hoveredRef = useRef<SimNode | null>(null);
  const selectedRef = useRef<SimNode | null>(null);
  const offsetRef = useRef({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{ node: SimNode | null; panStart: { x: number; y: number } | null }>({ node: null, panStart: null });
  const [sourceLabel, setSourceLabel] = useState<string>('');

  useEffect(() => {
    setSourceLabel(data.source || '');
  }, [data]);

  const toCanvas = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const { x, y, scale } = offsetRef.current;
    return {
      x: (clientX - rect.left - x) / scale,
      y: (clientY - rect.top - y) / scale,
    };
  }, []);

  const hitTest = useCallback((cx: number, cy: number): SimNode | null => {
    for (const node of [...nodesRef.current].reverse()) {
      const dx = cx - node.x;
      const dy = cy - node.y;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 6) return node;
    }
    return null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const width = () => canvas!.getBoundingClientRect().width;
    const height = () => canvas!.getBoundingClientRect().height;

    const nodeMap = new Map<string, SimNode>();
    nodesRef.current = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const radius = Math.min(width(), height()) * 0.3;
      const node: SimNode = {
        ...n,
        x: width() / 2 + Math.cos(angle) * radius,
        y: height() / 2 + Math.sin(angle) * radius,
        vx: 0, vy: 0,
        radius: 10 + Math.sqrt(n.size) / 7,
        color: TYPE_COLORS[n.type] || '#888',
        pulsePhase: Math.random() * Math.PI * 2,
      };
      nodeMap.set(n.id, node);
      return node;
    });

    linksRef.current = data.links.map(l => ({
      ...l,
      sourceNode: nodeMap.get(l.source)!,
      targetNode: nodeMap.get(l.target)!,
      particleOffset: Math.random(),
    })).filter(l => l.sourceNode && l.targetNode);

    let frame = 0;

    function draw() {
      const w = width();
      const h = height();
      const { x: ox, y: oy, scale } = offsetRef.current;
      const t = Date.now() / 1000;

      ctx!.clearRect(0, 0, w * dpr, h * dpr);
      ctx!.save();
      ctx!.translate(ox, oy);
      ctx!.scale(scale, scale);

      const nodes = nodesRef.current;
      const links = linksRef.current;
      frame++;

      // Physics (run every other frame for perf)
      if (frame % 2 === 0) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[j].x - nodes[i].x;
            const dy = nodes[j].y - nodes[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 3200 / (dist * dist);
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].vx -= fx; nodes[i].vy -= fy;
            nodes[j].vx += fx; nodes[j].vy += fy;
          }
        }
        for (const link of links) {
          const dx = link.targetNode.x - link.sourceNode.x;
          const dy = link.targetNode.y - link.sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const ideal = 140;
          const force = (dist - ideal) * 0.006 * link.strength;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          link.sourceNode.vx += fx; link.sourceNode.vy += fy;
          link.targetNode.vx -= fx; link.targetNode.vy -= fy;
        }
        for (const node of nodes) {
          if (dragRef.current.node === node) continue;
          node.vx += (w / 2 - node.x) * 0.0008;
          node.vy += (h / 2 - node.y) * 0.0008;
          node.vx *= 0.88; node.vy *= 0.88;
          node.x += node.vx; node.y += node.vy;
        }
      }

      // Draw links
      for (const link of links) {
        const sx = link.sourceNode.x, sy = link.sourceNode.y;
        const tx = link.targetNode.x, ty = link.targetNode.y;
        const isHovered = hoveredRef.current === link.sourceNode || hoveredRef.current === link.targetNode;
        const isSelected = selectedRef.current === link.sourceNode || selectedRef.current === link.targetNode;

        const alpha = isSelected ? 0.7 : isHovered ? 0.5 : link.strength * 0.3;
        const lw = isSelected ? link.strength * 2.5 : link.strength * 1.5;

        // Gradient line
        const grad = ctx!.createLinearGradient(sx, sy, tx, ty);
        grad.addColorStop(0, `${link.sourceNode.color}${Math.round(alpha * 255).toString(16).padStart(2,'0')}`);
        grad.addColorStop(1, `${link.targetNode.color}${Math.round(alpha * 255).toString(16).padStart(2,'0')}`);
        ctx!.beginPath();
        ctx!.moveTo(sx, sy);
        ctx!.lineTo(tx, ty);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = lw;
        ctx!.stroke();

        // Animated traffic particles
        const particleCount = Math.ceil(link.traffic / 600);
        for (let p = 0; p < particleCount; p++) {
          const phase = ((t * 0.3 + link.particleOffset + p / particleCount) % 1);
          const px = sx + (tx - sx) * phase;
          const py = sy + (ty - sy) * phase;
          const pAlpha = 1 - Math.abs(phase - 0.5) * 2;
          ctx!.beginPath();
          ctx!.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = `${link.sourceNode.color}${Math.round(pAlpha * 200).toString(16).padStart(2,'0')}`;
          ctx!.fill();
        }

        // Traffic label on hover
        if ((isHovered || isSelected) && link.traffic > 0) {
          const mx = (sx + tx) / 2, my = (sy + ty) / 2;
          ctx!.font = '9px system-ui';
          ctx!.fillStyle = '#888';
          ctx!.textAlign = 'center';
          ctx!.fillText(`${link.traffic}/hr`, mx, my - 6);
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const isHovered = hoveredRef.current === node;
        const isSelected = selectedRef.current === node;
        const pulse = Math.sin(t * 1.5 + node.pulsePhase) * 0.5 + 0.5;
        const glowRadius = node.radius * (isSelected ? 4.5 : isHovered ? 3.5 : 2.5 + pulse * 0.5);

        // Outer glow
        const glow = ctx!.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        const glowAlpha = isSelected ? '66' : isHovered ? '44' : '22';
        glow.addColorStop(0, `${node.color}${glowAlpha}`);
        glow.addColorStop(1, 'transparent');
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
        ctx!.fillStyle = glow;
        ctx!.fill();

        // Ring for selected
        if (isSelected) {
          ctx!.beginPath();
          ctx!.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
          ctx!.strokeStyle = node.color;
          ctx!.lineWidth = 2;
          ctx!.setLineDash([4, 4]);
          ctx!.lineDashOffset = -t * 8;
          ctx!.stroke();
          ctx!.setLineDash([]);
        }

        // Core circle
        const coreColor = node.status === 'warning' ? '#ffaa00' : node.status === 'error' ? '#ff0044' : node.color;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        const core = ctx!.createRadialGradient(node.x - node.radius * 0.3, node.y - node.radius * 0.3, 0, node.x, node.y, node.radius);
        core.addColorStop(0, `${coreColor}ff`);
        core.addColorStop(1, `${coreColor}88`);
        ctx!.fillStyle = core;
        ctx!.fill();

        ctx!.beginPath();
        ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx!.strokeStyle = isSelected || isHovered ? '#fff' : '#ffffff44';
        ctx!.lineWidth = isSelected ? 2 : 1;
        ctx!.stroke();

        // Label
        ctx!.font = `${isSelected || isHovered ? 'bold ' : ''}11px system-ui`;
        ctx!.fillStyle = isSelected || isHovered ? '#fff' : '#ccc';
        ctx!.textAlign = 'center';
        ctx!.fillText(node.label, node.x, node.y + node.radius + 14);

        ctx!.font = '9px system-ui';
        ctx!.fillStyle = TYPE_COLORS[node.type] || '#666';
        ctx!.fillText(`${TYPE_ICONS[node.type] || '•'} ${node.type}`, node.x, node.y + node.radius + 26);

        if (isSelected || isHovered) {
          ctx!.font = '9px system-ui';
          ctx!.fillStyle = '#555';
          ctx!.fillText(`${node.edges} links · ${node.size.toLocaleString()}`, node.x, node.y + node.radius + 38);
        }
      }

      ctx!.restore();
      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    // Mouse events
    function getPos(e: MouseEvent) {
      return toCanvas(e.clientX, e.clientY, canvas!.getBoundingClientRect());
    }

    function onMouseMove(e: MouseEvent) {
      const pos = getPos(e);
      if (dragRef.current.node) {
        dragRef.current.node.x = pos.x;
        dragRef.current.node.y = pos.y;
        dragRef.current.node.vx = 0;
        dragRef.current.node.vy = 0;
        return;
      }
      if (dragRef.current.panStart) {
        offsetRef.current.x += e.movementX;
        offsetRef.current.y += e.movementY;
        return;
      }
      hoveredRef.current = hitTest(pos.x, pos.y);
      canvas!.style.cursor = hoveredRef.current ? 'pointer' : 'grab';
    }

    function onMouseDown(e: MouseEvent) {
      const pos = getPos(e);
      const hit = hitTest(pos.x, pos.y);
      if (hit) { dragRef.current.node = hit; }
      else { dragRef.current.panStart = { x: e.clientX, y: e.clientY }; canvas!.style.cursor = 'grabbing'; }
    }

    function onMouseUp(e: MouseEvent) {
      if (dragRef.current.node) {
        const pos = getPos(e);
        const still = Math.abs(pos.x - dragRef.current.node.x) < 5 && Math.abs(pos.y - dragRef.current.node.y) < 5;
        if (still) {
          selectedRef.current = selectedRef.current === dragRef.current.node ? null : dragRef.current.node;
          onNodeClick?.(selectedRef.current);
        }
      }
      dragRef.current.node = null;
      dragRef.current.panStart = null;
      canvas!.style.cursor = 'grab';
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const rect = canvas!.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      offsetRef.current.scale *= factor;
      offsetRef.current.x = mx - (mx - offsetRef.current.x) * factor;
      offsetRef.current.y = my - (my - offsetRef.current.y) * factor;
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [data, toCanvas, hitTest, onNodeClick]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '460px', borderRadius: '8px', cursor: 'grab', display: 'block' }} />
      <div style={{ position: 'absolute', bottom: '10px', left: '12px', fontSize: '10px', color: '#333', display: 'flex', gap: '12px', alignItems: 'center' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <span key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ color: '#444' }}>{type}</span>
          </span>
        ))}
      </div>
      {sourceLabel && (
        <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', background: sourceLabel.includes('graphify-live') ? '#00ff8822' : '#ffaa0022', color: sourceLabel.includes('graphify-live') ? '#00ff88' : '#ffaa00', border: `1px solid ${sourceLabel.includes('graphify-live') ? '#00ff8844' : '#ffaa0044'}` }}>
          {sourceLabel.includes('graphify-live') ? '● live' : '◌ synthetic'}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '10px', color: '#333' }}>
        scroll to zoom · drag to pan · click node to inspect
      </div>
    </div>
  );
}
