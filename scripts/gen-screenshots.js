// Generates representative dashboard screenshots using node-canvas
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '../docs/screenshots');
fs.mkdirSync(OUT, { recursive: true });

const W = 1400, H = 900;
const BG = '#070710', PANEL = '#0d0d18', BORDER = '#111118';
const GREEN = '#00ff88', CYAN = '#00ccff', AMBER = '#ffaa00', PURPLE = '#cc88ff', PINK = '#ff6688', RED = '#ff0044';

function base(ctx) {
  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.fillStyle = '#07071099';
  ctx.fillRect(0, 0, W, 56);
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, 56); ctx.lineTo(W, 56); ctx.stroke();

  // Title
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = GREEN;
  ctx.fillText('SurfingNeo-OS', 28, 30);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText('Neural Mesh · FinSurfing · Prompt Engineering · Knowledge Graph', 28, 47);

  // Status badges
  const badges = [
    { label: 'Graphify', color: GREEN, x: W - 340 },
    { label: 'MCP', color: GREEN, x: W - 260 },
    { label: 'SSE', color: GREEN, x: W - 200 },
  ];
  badges.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, 28, 4, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#555';
    ctx.fillText(b.label, b.x + 10, 33);
  });

  // Refresh button
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1;
  ctx.strokeRect(W - 120, 16, 70, 24);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#555';
  ctx.fillText('↺  Refresh', W - 113, 32);

  // Time
  ctx.fillStyle = '#222';
  ctx.font = '10px monospace';
  ctx.fillText('01:24:11', W - 38, 33);
}

function panel(ctx, x, y, w, h, title) {
  ctx.fillStyle = PANEL;
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill(); ctx.stroke();
  if (title) {
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = GREEN;
    ctx.fillText(title, x + 16, y + 30);
  }
}

function tabs(ctx, x, y, active) {
  const tabs = ['🔗 Connection Topology', '🌊 Platform Mesh', '📈 30-Day Trajectory'];
  tabs.forEach((t, i) => {
    const tw = i === 0 ? 180 : i === 1 ? 140 : 160;
    const tx = x + [0, 192, 344][i];
    const isActive = i === active;
    ctx.fillStyle = isActive ? '#00ff8812' : 'transparent';
    ctx.strokeStyle = isActive ? '#00ff8833' : 'transparent';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(tx, y, tw, 32, 8); ctx.fill(); ctx.stroke();
    ctx.font = '13px sans-serif';
    ctx.fillStyle = isActive ? GREEN : '#444';
    ctx.fillText(t, tx + 10, y + 21);
  });
}

// ─── RIGHT COLUMN (shared) ───────────────────────────────────────────────────
function rightColumn(ctx) {
  const rx = W - 380, ry = 76;

  // Brain Health panel
  panel(ctx, rx, ry, 352, 480, '📊 Brain Health');

  // Overall score
  ctx.fillStyle = '#070710';
  ctx.strokeStyle = '#00ff8833';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(rx + 12, ry + 40, 328, 80, 8); ctx.fill(); ctx.stroke();
  ctx.font = 'bold 48px sans-serif';
  ctx.fillStyle = GREEN;
  ctx.textAlign = 'center';
  ctx.fillText('87', rx + 176, ry + 99);
  ctx.font = '11px sans-serif';
  ctx.fillStyle = '#444';
  ctx.fillText('OVERALL BRAIN SCORE', rx + 176, ry + 113);
  ctx.font = '12px sans-serif';
  ctx.fillStyle = GREEN;
  ctx.fillText('▲ 3.4% · Strong', rx + 176, ry + 128);
  ctx.textAlign = 'left';

  // Three brain score bars
  const brains = [
    { name: 'API Brain', score: 87, trend: '+3.2%', color: GREEN, details: [['Requests','45,230'],['Avg latency','45ms'],['p99 latency','180ms'],['Uptime','99.97%']] },
    { name: 'Secondary Brain', score: 82, trend: '+5.1%', color: AMBER, details: [['Insights','1,847'],['Accuracy','94%'],['Model','v2.3.1'],['Learning','15%']] },
    { name: 'Knowledge Graph', score: 91, trend: '+1.8%', color: CYAN, details: [['Nodes','2,847'],['Edges','156'],['Growth/day','+12.4'],['Sync health','98.5%']] },
  ];
  brains.forEach((b, i) => {
    const by = ry + 132 + i * 108;
    ctx.fillStyle = '#070710';
    ctx.strokeStyle = BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(rx + 12, by, 328, 96, 8); ctx.fill(); ctx.stroke();

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#d0d0d0';
    ctx.fillText(b.name, rx + 22, by + 18);

    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = b.color;
    ctx.textAlign = 'right';
    ctx.fillText(b.score, rx + 330, by + 18);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = GREEN;
    ctx.fillText(b.trend, rx + 328, by + 34);
    ctx.textAlign = 'left';

    // Bar
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.roundRect(rx + 22, by + 40, 316, 4, 2); ctx.fill();
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.roundRect(rx + 22, by + 40, 316 * b.score / 100, 4, 2); ctx.fill();

    // Details grid
    b.details.forEach((d, di) => {
      const dx = rx + 22 + (di % 2) * 164, dy = by + 56 + Math.floor(di / 2) * 18;
      ctx.font = '10px sans-serif';
      ctx.fillStyle = '#444';
      ctx.fillText(d[0], dx, dy);
      ctx.fillStyle = '#999';
      ctx.textAlign = 'right';
      ctx.fillText(d[1], dx + 150, dy);
      ctx.textAlign = 'left';
    });
  });

  // Live Connections
  panel(ctx, rx, ry + 492, 352, 130, '📡 SSE Connection Log');
  const logTypes = [
    { t: '01:24:08', type: 'graphify_update', src: 'graphify', msg: 'graph.sync', color: CYAN },
    { t: '01:24:06', type: 'webhook_ingested', src: 'finsurfing', msg: 'portfolio.analyze', color: GREEN },
    { t: '01:24:03', type: 'mcp_result', src: 'mcp', msg: 'tool.invoke', color: AMBER },
    { t: '01:24:01', type: 'graphify_update', src: 'graphify', msg: 'edge.update', color: CYAN },
  ];
  logTypes.forEach((l, i) => {
    const ly = ry + 532 + i * 22;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#2a2a3a'; ctx.fillText(l.t, rx + 16, ly);
    ctx.fillStyle = l.color; ctx.fillText(l.type, rx + 80, ly);
    ctx.fillStyle = '#555'; ctx.fillText(l.src, rx + 210, ly);
    ctx.fillStyle = '#888'; ctx.fillText(l.msg, rx + 290, ly);
  });

  // System status
  panel(ctx, rx, ry + 634, 352, 100, null);
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#333';
  ctx.fillText('SYSTEM', rx + 16, ry + 658);
  [
    ['SSE clients', '0', GREEN],
    ['Graphify circuit', 'CLOSED', GREEN],
    ['MCP circuit', 'CLOSED', GREEN],
    ['Graph source', 'synthetic-fallback', AMBER],
  ].forEach(([k, v, c], i) => {
    const sy = ry + 668 + i * 16;
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#333'; ctx.fillText(k, rx + 16, sy);
    ctx.fillStyle = c; ctx.textAlign = 'right'; ctx.font = '10px monospace';
    ctx.fillText(v, rx + 338, sy);
    ctx.textAlign = 'left';
  });
}

// ─── SCREENSHOT 1: TOPOLOGY ──────────────────────────────────────────────────
function makeTopology() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  base(ctx);
  rightColumn(ctx);

  const lx = 20, ly = 76, lw = W - 400, lh = H - 80;

  // Main panel
  panel(ctx, lx, ly, lw, lh, null);
  tabs(ctx, lx + 12, ly + 10, 0);

  // Source badge
  ctx.fillStyle = '#ffaa0022';
  ctx.strokeStyle = '#ffaa0044';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(lx + lw - 110, ly + 14, 96, 20, 10); ctx.fill(); ctx.stroke();
  ctx.font = '10px sans-serif'; ctx.fillStyle = AMBER;
  ctx.fillText('◌ synthetic', lx + lw - 98, ly + 27);

  // Force graph area
  const gx = lx + 16, gy = ly + 52, gw = lw - 32, gh = lh - 340;

  // Draw nodes and links
  const cx = gx + gw / 2, cy = gy + gh / 2;
  const nodes = [
    { id: 'kb-core', label: 'Knowledge Base Core', type: 'brain', color: GREEN, x: 0, y: -0.5, r: 22 },
    { id: 'api-brain', label: 'API Brain', type: 'brain', color: GREEN, x: -0.5, y: 0.1, r: 18 },
    { id: 'secondary-brain', label: 'Secondary Brain', type: 'brain', color: GREEN, x: 0.5, y: 0.1, r: 16 },
    { id: 'graphify', label: 'Graphify Engine', type: 'engine', color: CYAN, x: 0, y: 0.5, r: 26 },
    { id: 'mcp-claude', label: 'Claude MCP', type: 'interface', color: AMBER, x: -0.8, y: -0.2, r: 12 },
    { id: 'vercel-api', label: 'Vercel API Layer', type: 'infrastructure', color: PURPLE, x: 0.8, y: -0.3, r: 15 },
    { id: 'site-1', label: 'FinSurfing', type: 'platform', color: '#ff9944', x: -0.7, y: 0.6, r: 13 },
    { id: 'site-2', label: 'Website 2', type: 'source', color: PINK, x: 0.7, y: 0.6, r: 11 },
    { id: 'memory-space', label: 'Memory Space', type: 'storage', color: '#88ccff', x: -0.3, y: -0.8, r: 14 },
    { id: 'skill-registry', label: 'SKILL.md Registry', type: 'storage', color: '#88ccff', x: 0.3, y: -0.8, r: 12 },
  ];
  const radius = Math.min(gw, gh) * 0.36;
  nodes.forEach(n => {
    n.px = cx + n.x * radius;
    n.py = cy + n.y * radius;
  });
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const links = [
    ['kb-core','api-brain',0.95],['api-brain','secondary-brain',0.88],['kb-core','graphify',0.92],
    ['api-brain','graphify',0.85],['secondary-brain','graphify',0.78],['api-brain','mcp-claude',0.90],
    ['vercel-api','api-brain',0.82],['vercel-api','graphify',0.75],['site-1','vercel-api',0.70],
    ['site-2','vercel-api',0.65],['memory-space','kb-core',0.80],['skill-registry','api-brain',0.72],
  ];

  // Draw links
  links.forEach(([s, t, str]) => {
    const sn = nodeMap[s], tn = nodeMap[t];
    if (!sn || !tn) return;
    const grad = ctx.createLinearGradient(sn.px, sn.py, tn.px, tn.py);
    grad.addColorStop(0, sn.color + Math.round(str * 80).toString(16).padStart(2,'0'));
    grad.addColorStop(1, tn.color + Math.round(str * 80).toString(16).padStart(2,'0'));
    ctx.beginPath();
    ctx.moveTo(sn.px, sn.py);
    ctx.lineTo(tn.px, tn.py);
    ctx.strokeStyle = grad;
    ctx.lineWidth = str * 2.5;
    ctx.stroke();

    // Traffic particle
    const t2 = 0.4;
    const px = sn.px + (tn.px - sn.px) * t2, py = sn.py + (tn.py - sn.py) * t2;
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = sn.color + 'cc'; ctx.fill();
  });

  // Draw nodes
  nodes.forEach(n => {
    // Glow
    const grd = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, n.r * 3);
    grd.addColorStop(0, n.color + '33'); grd.addColorStop(1, 'transparent');
    ctx.beginPath(); ctx.arc(n.px, n.py, n.r * 3, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();

    // Core
    const core = ctx.createRadialGradient(n.px - n.r * 0.3, n.py - n.r * 0.3, 0, n.px, n.py, n.r);
    core.addColorStop(0, n.color); core.addColorStop(1, n.color + '88');
    ctx.beginPath(); ctx.arc(n.px, n.py, n.r, 0, Math.PI * 2);
    ctx.fillStyle = core; ctx.fill();
    ctx.strokeStyle = '#ffffff44'; ctx.lineWidth = 1.5; ctx.stroke();

    // Label
    ctx.font = '10px sans-serif'; ctx.fillStyle = '#ccc'; ctx.textAlign = 'center';
    ctx.fillText(n.label, n.px, n.py + n.r + 13);
    ctx.font = '9px sans-serif'; ctx.fillStyle = n.color + '99';
    ctx.fillText(n.type, n.px, n.py + n.r + 24);
    ctx.textAlign = 'left';
  });

  // Legend
  const typeColors = { brain: GREEN, engine: CYAN, interface: AMBER, infrastructure: PURPLE, platform: '#ff9944', source: PINK, storage: '#88ccff' };
  let lxi = gx + 8;
  Object.entries(typeColors).forEach(([type, color]) => {
    ctx.beginPath(); ctx.arc(lxi, gy + gh + 12, 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.font = '9px sans-serif'; ctx.fillStyle = '#444';
    ctx.fillText(type, lxi + 8, gy + gh + 16);
    lxi += type.length * 5.5 + 20;
  });

  // Hint
  ctx.font = '9px sans-serif'; ctx.fillStyle = '#222'; ctx.textAlign = 'right';
  ctx.fillText('scroll to zoom · drag to pan · click node to inspect', gx + gw, gy + gh + 16);
  ctx.textAlign = 'left';

  // Data flow ticker below graph
  const ty2 = ly + lh - 290;
  ctx.fillStyle = '#070710';
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(lx + 16, ty2, lw - 32, 260, 8); ctx.fill(); ctx.stroke();

  ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = GREEN;
  ctx.fillText('⚡ Live Data Flow', lx + 28, ty2 + 20);

  // Ticker header
  ctx.font = '10px monospace'; ctx.fillStyle = '#222';
  ['TIME','PLATFORM','ACTION','DETAIL'].forEach((h, i) => {
    ctx.fillText(h, lx + 28 + [0,70,170,300][i], ty2 + 36);
  });

  const tickerRows = [
    { t:'01:24:11', platform:'graphify', action:'graph.sync', detail:'+14 new nodes', color: CYAN },
    { t:'01:24:09', platform:'finsurfing', action:'portfolio.analyze', detail:'94 signals processed', color:'#ff9944' },
    { t:'01:24:07', platform:'prompt-eng', action:'prompt.optimize', detail:'38 tokens saved', color: PURPLE },
    { t:'01:24:05', platform:'api-brain', action:'req.complete', detail:'28ms p50', color: GREEN },
    { t:'01:24:03', platform:'finsurfing', action:'market.surf', detail:'AAPL +2.4% detected', color:'#ff9944' },
    { t:'01:24:01', platform:'mcp', action:'tool.invoke', detail:'web_search called', color: AMBER },
    { t:'01:23:59', platform:'kb-core', action:'knowledge.ingest', detail:'1 doc → 23 chunks', color: GREEN },
    { t:'01:23:57', platform:'prompt-eng', action:'chain.execute', detail:'3-step chain done', color: PURPLE },
  ];
  tickerRows.forEach((r, i) => {
    const ry2 = ty2 + 48 + i * 24;
    const alpha = Math.max(0.25, 1 - i * 0.09);
    ctx.globalAlpha = alpha;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#2a2a3a'; ctx.fillText(r.t, lx + 28, ry2);
    ctx.fillStyle = r.color; ctx.fillText(r.platform, lx + 98, ry2);
    ctx.fillStyle = '#555'; ctx.fillText(r.action, lx + 198, ry2);
    ctx.fillStyle = '#888'; ctx.fillText(r.detail, lx + 328, ry2);
    ctx.globalAlpha = 1;
  });

  fs.writeFileSync(path.join(OUT, 'topology.png'), canvas.toBuffer('image/png'));
  console.log('✓ topology.png');
}

// ─── SCREENSHOT 2: PLATFORM MESH ─────────────────────────────────────────────
function makePlatformMesh() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  base(ctx);
  rightColumn(ctx);

  const lx = 20, ly = 76, lw = W - 400, lh = H - 80;
  panel(ctx, lx, ly, lw, lh, null);
  tabs(ctx, lx + 12, ly + 10, 1);

  // Subheader
  ctx.font = '12px sans-serif'; ctx.fillStyle = '#444';
  ctx.fillText('6 active integration links across 4 platforms', lx + 24, ly + 56);
  ctx.fillStyle = '#ffaa0022'; ctx.strokeStyle = '#ffaa0044'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(lx + lw - 120, ly + 43, 106, 20, 10); ctx.fill(); ctx.stroke();
  ctx.font = '10px sans-serif'; ctx.fillStyle = AMBER;
  ctx.fillText('◌ synthetic', lx + lw - 108, ly + 56);

  // Platform cards (2x2 grid)
  const platforms = [
    { name: 'FinSurfing', icon: '🏄', color: '#ff9944', status: 'active', health: 94, latency: '38ms', req: '8,420', flow: '2.4 Mbps', endpoints: ['/api/portfolio/analyze · 1,240 · 42ms', '/api/market/signals · 3,100 · 28ms', '/api/risk/score · 890 · 61ms'] },
    { name: 'Prompt Engineering Platform', icon: '🔮', color: PURPLE, status: 'active', health: 89, latency: '52ms', req: '3,860', flow: '0.8 Mbps', endpoints: ['/api/prompt/optimize · 870 · 110ms', '/api/template/render · 1,540 · 45ms', '/api/chain/execute · 680 · 290ms'] },
    { name: 'Graphify Engine', icon: '⚙️', color: CYAN, status: 'active', health: 97, latency: '22ms', req: '12,480', circuit: 'CLOSED', endpoints: [] },
    { name: 'Claude MCP', icon: '🔌', color: AMBER, status: 'active', health: 99, latency: '—', invocations: '156', tools: '4', endpoints: [] },
  ];

  const cw = (lw - 48) / 2;
  platforms.forEach((p, i) => {
    const cx2 = lx + 16 + (i % 2) * (cw + 16);
    const cy2 = ly + 68 + Math.floor(i / 2) * 210;

    ctx.fillStyle = '#070710';
    ctx.strokeStyle = p.color + '33';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(cx2, cy2, cw, 195, 10); ctx.fill(); ctx.stroke();

    // Header
    ctx.font = '18px sans-serif'; ctx.fillText(p.icon, cx2 + 12, cy2 + 26);
    ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = '#e0e0e0';
    ctx.fillText(p.name, cx2 + 38, cy2 + 22);

    // Status dot
    ctx.beginPath(); ctx.arc(cx2 + cw - 50, cy2 + 18, 4, 0, Math.PI * 2);
    ctx.fillStyle = GREEN; ctx.fill();
    ctx.font = '11px sans-serif'; ctx.fillStyle = GREEN;
    ctx.fillText('Active', cx2 + cw - 42, cy2 + 22);

    // Stats
    const stats = p.circuit
      ? [['Latency', p.latency, '#aaa'], ['Req/day', p.req, '#aaa'], ['Circuit', p.circuit, GREEN]]
      : p.invocations
      ? [['Tools', p.tools, '#aaa'], ['Invocations', p.invocations, '#aaa']]
      : [['Latency', p.latency, '#aaa'], ['Req/day', p.req, '#aaa'], ['Flow', p.flow, p.color]];

    stats.forEach((s, si) => {
      const sx = cx2 + 12 + si * (cw / stats.length);
      ctx.font = '9px sans-serif'; ctx.fillStyle = '#444';
      ctx.fillText(s[0].toUpperCase(), sx, cy2 + 44);
      ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = s[2];
      ctx.fillText(s[1], sx, cy2 + 58);
    });

    // Health bar
    ctx.font = '10px sans-serif'; ctx.fillStyle = '#444';
    ctx.fillText('Health', cx2 + 12, cy2 + 76);
    ctx.fillStyle = p.color; ctx.textAlign = 'right';
    ctx.fillText(p.health + '%', cx2 + cw - 12, cy2 + 76);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.roundRect(cx2 + 12, cy2 + 80, cw - 24, 4, 2); ctx.fill();
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.roundRect(cx2 + 12, cy2 + 80, (cw - 24) * p.health / 100, 4, 2); ctx.fill();

    // Endpoints
    if (p.endpoints.length > 0) {
      ctx.font = '9px sans-serif'; ctx.fillStyle = '#444';
      ctx.fillText('TOP ENDPOINTS', cx2 + 12, cy2 + 103);
      p.endpoints.forEach((ep, ei) => {
        const ey = cy2 + 116 + ei * 22;
        ctx.fillStyle = '#070710'; ctx.strokeStyle = '#0d0d18'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(cx2 + 12, ey - 12, cw - 24, 18, 3); ctx.fill();
        ctx.font = '9px monospace'; ctx.fillStyle = '#555';
        ctx.fillText(ep, cx2 + 16, ey);
      });
    } else {
      const extras = p.circuit
        ? [['Failures', '0'], ['Half-open calls', '0']]
        : [['Available tools', p.tools], ['Invocations', p.invocations]];
      extras.forEach(([k, v], ei) => {
        const ey = cy2 + 120 + ei * 22;
        ctx.font = '11px sans-serif'; ctx.fillStyle = '#444'; ctx.fillText(k, cx2 + 12, ey);
        ctx.fillStyle = GREEN; ctx.textAlign = 'right'; ctx.fillText(v, cx2 + cw - 12, ey); ctx.textAlign = 'left';
      });
    }
  });

  // Integration Links
  const tly = ly + 510;
  ctx.font = '10px sans-serif'; ctx.fillStyle = '#333';
  ctx.fillText('INTEGRATION LINKS', lx + 24, tly);

  const links2 = [
    { from:'finsurfing', to:'kb-core', label:'market data → KB', mbps:'1.2 Mbps', bi: true },
    { from:'finsurfing', to:'api-brain', label:'portfolio signals → API Brain', mbps:'0.8 Mbps', bi: false },
    { from:'prompt-eng', to:'secondary-brain', label:'prompt chains → Secondary Brain', mbps:'0.3 Mbps', bi: true },
    { from:'graphify', to:'kb-core', label:'graph sync', mbps:'2.1 Mbps', bi: true },
    { from:'mcp', to:'api-brain', label:'tool results', mbps:'0.4 Mbps', bi: false },
  ];
  links2.forEach((l, i) => {
    const ry3 = tly + 14 + i * 28;
    ctx.fillStyle = '#070710'; ctx.strokeStyle = BORDER; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(lx + 16, ry3, lw - 32, 22, 4); ctx.fill(); ctx.stroke();
    ctx.font = '11px monospace'; ctx.fillStyle = '#555';
    ctx.fillText(l.from, lx + 26, ry3 + 15);
    ctx.fillStyle = '#333';
    ctx.fillText(l.bi ? '⟺' : '→', lx + 120, ry3 + 15);
    ctx.fillStyle = '#555';
    ctx.fillText(l.to, lx + 145, ry3 + 15);
    ctx.fillStyle = '#444'; ctx.fillText(l.label, lx + 260, ry3 + 15);
    ctx.fillStyle = CYAN; ctx.textAlign = 'right';
    ctx.fillText(l.mbps, lx + lw - 30, ry3 + 15); ctx.textAlign = 'left';
  });

  fs.writeFileSync(path.join(OUT, 'platform-mesh.png'), canvas.toBuffer('image/png'));
  console.log('✓ platform-mesh.png');
}

// ─── SCREENSHOT 3: TRAJECTORY ─────────────────────────────────────────────────
function makeTrajectory() {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  base(ctx);
  rightColumn(ctx);

  const lx = 20, ly = 76, lw = W - 400, lh = H - 80;
  panel(ctx, lx, ly, lw, lh, null);
  tabs(ctx, lx + 12, ly + 10, 2);

  // Legend toggles
  const metrics = [
    { key:'Brain Score', color: GREEN, active: true },
    { key:'KB Nodes', color: CYAN, active: true },
    { key:'API Requests', color: AMBER, active: true },
    { key:'Insights', color: PURPLE, active: false },
  ];
  let lgx = lx + 20;
  metrics.forEach(m => {
    ctx.fillStyle = m.active ? m.color + '18' : 'transparent';
    ctx.strokeStyle = m.active ? m.color + '44' : '#1a1a2e';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(lgx, ly + 48, m.key.length * 6.5 + 24, 22, 11); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(lgx + 10, ly + 59, 4, 0, Math.PI * 2);
    ctx.fillStyle = m.active ? m.color : '#333'; ctx.fill();
    ctx.font = '10px sans-serif'; ctx.fillStyle = m.active ? m.color : '#444';
    ctx.fillText(m.key, lgx + 18, ly + 63);
    lgx += m.key.length * 6.5 + 34;
  });

  // Chart
  const chartX = lx + 60, chartY = ly + 78, chartW = lw - 76, chartH = 280;

  // Grid
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const gy2 = chartY + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(chartX, gy2); ctx.lineTo(chartX + chartW, gy2); ctx.stroke();
    ctx.font = '9px sans-serif'; ctx.fillStyle = '#333'; ctx.textAlign = 'right';
    ctx.fillText((100 - i * 25) + '%', chartX - 6, gy2 + 4);
  }
  ctx.textAlign = 'left';

  // Generate 30 data points
  const days = 30;
  const series = {
    brainScore: Array.from({length:days}, (_,i) => 68 + i * 0.63 + Math.sin(i * 0.8) * 2),
    kbNodes:    Array.from({length:days}, (_,i) => 2400 + i * 15 + Math.sin(i * 0.5) * 20),
    apiReq:     Array.from({length:days}, (_,i) => 1200 + i * 45 + Math.cos(i * 0.7) * 80),
  };

  function drawSeries(values, color, max, min) {
    const range = max - min || 1;
    const toY = v => chartY + chartH - ((v - min) / range) * chartH;
    const toX = i => chartX + (i / (days - 1)) * chartW;

    // Fill
    ctx.beginPath();
    ctx.fillStyle = color + '12';
    values.forEach((v, i) => { i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)); });
    ctx.lineTo(toX(days-1), chartY + chartH); ctx.lineTo(chartX, chartY + chartH); ctx.closePath(); ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    values.forEach((v, i) => { i === 0 ? ctx.moveTo(toX(i), toY(v)) : ctx.lineTo(toX(i), toY(v)); });
    ctx.stroke();
  }

  drawSeries(series.brainScore, GREEN, Math.max(...series.brainScore), Math.min(...series.brainScore) - 2);
  drawSeries(series.kbNodes, CYAN, Math.max(...series.kbNodes), Math.min(...series.kbNodes) - 100);
  drawSeries(series.apiReq, AMBER, Math.max(...series.apiReq), Math.min(...series.apiReq) - 200);

  // Hover line at day 22
  const hoverI = 22;
  const hx2 = chartX + (hoverI / (days - 1)) * chartW;
  ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.setLineDash([3,3]);
  ctx.beginPath(); ctx.moveTo(hx2, chartY); ctx.lineTo(hx2, chartY + chartH); ctx.stroke();
  ctx.setLineDash([]);

  // Hover dots
  [[series.brainScore, GREEN],[series.kbNodes, CYAN],[series.apiReq, AMBER]].forEach(([vals, color]) => {
    const max = Math.max(...vals), min = Math.min(...vals) - (vals === series.brainScore ? 2 : vals === series.kbNodes ? 100 : 200);
    const range = max - min;
    const toY = v => chartY + chartH - ((v - min) / range) * chartH;
    ctx.beginPath(); ctx.arc(hx2, toY(vals[hoverI]), 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
  });

  // Tooltip
  ctx.fillStyle = '#0d0d18ee'; ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(hx2 + 8, chartY + 4, 145, 60, 4); ctx.fill(); ctx.stroke();
  ctx.font = 'bold 9px sans-serif'; ctx.fillStyle = '#555';
  ctx.fillText('06-01', hx2 + 16, chartY + 18);
  [[GREEN,'Brain Score','82.9'],[CYAN,'KB Nodes','2,730'],[AMBER,'API Requests','2,190']].forEach(([c,l,v],i) => {
    ctx.font = '9px sans-serif'; ctx.fillStyle = c;
    ctx.fillText(`${l}: ${v}`, hx2 + 16, chartY + 28 + i * 14);
  });

  // X axis dates
  ctx.textAlign = 'center';
  for (let i = 0; i < days; i += 7) {
    const dx = chartX + (i / (days - 1)) * chartW;
    const d = new Date(2026, 4, 9 + i);
    ctx.font = '9px sans-serif'; ctx.fillStyle = '#333';
    ctx.fillText(`${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`, dx, chartY + chartH + 14);
  }
  ctx.textAlign = 'left';

  // Summary stat cards
  const stats2 = [
    { label:'KB Nodes', value:'2,847', color:CYAN, trend:'+12.4/day' },
    { label:'API Requests', value:'45,230', color:AMBER, trend:'45ms avg' },
    { label:'Insights', value:'1,847', color:PURPLE, trend:'94% accuracy' },
    { label:'Brain Score', value:'87', color:GREEN, trend:'▲ 3.4% this month' },
  ];
  const sw = (lw - 64) / 4;
  stats2.forEach((s, i) => {
    const sx = lx + 16 + i * (sw + 8);
    const sy = ly + 382;
    ctx.fillStyle = '#070710'; ctx.strokeStyle = BORDER; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(sx, sy, sw, 80, 8); ctx.fill(); ctx.stroke();
    ctx.font = '10px sans-serif'; ctx.fillStyle = '#333';
    ctx.fillText(s.label.toUpperCase(), sx + 12, sy + 18);
    ctx.font = 'bold 22px sans-serif'; ctx.fillStyle = s.color;
    ctx.fillText(s.value, sx + 12, sy + 46);
    ctx.font = '10px sans-serif'; ctx.fillStyle = '#444';
    ctx.fillText(s.trend, sx + 12, sy + 62);
  });

  // Data flow ticker
  const ty3 = ly + 478;
  ctx.fillStyle = '#070710'; ctx.strokeStyle = BORDER; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(lx + 16, ty3, lw - 32, 240, 8); ctx.fill(); ctx.stroke();
  ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = GREEN;
  ctx.fillText('⚡ Live Data Flow', lx + 28, ty3 + 20);

  const tickerRows2 = [
    { t:'01:24:11', platform:'graphify', action:'graph.sync', detail:'+14 new nodes', color: CYAN },
    { t:'01:24:09', platform:'finsurfing', action:'portfolio.analyze', detail:'94 signals processed', color:'#ff9944' },
    { t:'01:24:07', platform:'prompt-eng', action:'prompt.optimize', detail:'38 tokens saved', color: PURPLE },
    { t:'01:24:05', platform:'api-brain', action:'req.complete', detail:'28ms p50', color: GREEN },
    { t:'01:24:03', platform:'kb-core', action:'knowledge.ingest', detail:'1 doc → 23 chunks', color: GREEN },
    { t:'01:24:01', platform:'mcp', action:'tool.invoke', detail:'web_search called', color: AMBER },
  ];
  ctx.font = '10px monospace'; ctx.fillStyle = '#222';
  ['TIME','PLATFORM','ACTION','DETAIL'].forEach((h, i) => {
    ctx.fillText(h, lx + 28 + [0,70,170,300][i], ty3 + 36);
  });
  tickerRows2.forEach((r, i) => {
    const ry4 = ty3 + 50 + i * 28;
    ctx.globalAlpha = Math.max(0.25, 1 - i * 0.12);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#2a2a3a'; ctx.fillText(r.t, lx + 28, ry4);
    ctx.fillStyle = r.color; ctx.fillText(r.platform, lx + 98, ry4);
    ctx.fillStyle = '#555'; ctx.fillText(r.action, lx + 198, ry4);
    ctx.fillStyle = '#888'; ctx.fillText(r.detail, lx + 328, ry4);
    ctx.globalAlpha = 1;
  });

  fs.writeFileSync(path.join(OUT, 'trajectory.png'), canvas.toBuffer('image/png'));
  console.log('✓ trajectory.png');
}

makeTopology();
makePlatformMesh();
makeTrajectory();
console.log('\nAll screenshots saved to docs/screenshots/');
