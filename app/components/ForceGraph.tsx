'use client';

import { useEffect, useRef } from 'react';

interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    status: string;
    edges: number;
    size: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    strength: number;
    type: string;
    traffic: number;
  }>;
}

export default function ForceGraph({ data }: { data: GraphData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const nodesRef = useRef<any[]>([]);
  const linksRef = useRef<any[]>([]);

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

    const width = rect.width;
    const height = rect.height;

    // Initialize node positions
    const typeColors: Record<string, string> = {
      brain: '#00ff88',
      engine: '#00ccff',
      interface: '#ffaa00',
      infrastructure: '#cc88ff',
      source: '#ff6688',
      storage: '#88ccff',
    };

    const nodeMap = new Map();
    nodesRef.current = data.nodes.map((n, i) => {
      const angle = (i / data.nodes.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.35;
      const node = {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: 8 + Math.sqrt(n.size) / 8,
        color: typeColors[n.type] || '#888',
      };
      nodeMap.set(n.id, node);
      return node;
    });

    linksRef.current = data.links.map(l => ({
      ...l,
      sourceNode: nodeMap.get(l.source),
      targetNode: nodeMap.get(l.target),
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Physics simulation (simplified force-directed)
      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 2000 / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction (links)
      for (const link of links) {
        const dx = link.targetNode.x - link.sourceNode.x;
        const dy = link.targetNode.y - link.sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 120) * 0.008 * link.strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        link.sourceNode.vx += fx;
        link.sourceNode.vy += fy;
        link.targetNode.vx -= fx;
        link.targetNode.vy -= fy;
      }

      // Center gravity
      for (const node of nodes) {
        node.vx += (width / 2 - node.x) * 0.001;
        node.vy += (height / 2 - node.y) * 0.001;
        node.vx *= 0.92;
        node.vy *= 0.92;
        node.x += node.vx;
        node.y += node.vy;
      }

      // Draw links
      for (const link of links) {
        const sx = link.sourceNode.x;
        const sy = link.sourceNode.y;
        const tx = link.targetNode.x;
        const ty = link.targetNode.y;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = `rgba(0, 255, 136, ${link.strength * 0.4})`;
        ctx.lineWidth = link.strength * 2;
        ctx.stroke();

        // Animated pulse on link
        const midX = (sx + tx) / 2;
        const midY = (sy + ty) / 2;
        const pulse = (Date.now() / 1000) % 1;
        const px = sx + (tx - sx) * pulse;
        const py = sy + (ty - sy) * pulse;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${0.8 * (1 - Math.abs(pulse - 0.5) * 2)})`;
        ctx.fill();
      }

      // Draw nodes
      for (const node of nodes) {
        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
        gradient.addColorStop(0, `${node.color}44`);
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.status === 'warning' ? '#ffaa00' : node.color;
        ctx.fill();

        // Border
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = '#ccc';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 16);

        // Type badge
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(node.type, node.x, node.y + node.radius + 28);

        // Size indicator
        ctx.font = '9px system-ui, sans-serif';
        ctx.fillStyle = '#444';
        ctx.fillText(`${node.size} nodes`, node.x, node.y + node.radius + 40);
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '420px', borderRadius: '8px', cursor: 'grab' }}
    />
  );
}