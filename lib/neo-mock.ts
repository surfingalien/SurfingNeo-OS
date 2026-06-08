export type Theme = 'neural' | 'neon' | 'ocean' | 'aurora' | 'ember';

export const THEMES: { id: Theme; name: string; emoji: string }[] = [
  { id: 'neural', name: 'Dark Neural', emoji: '🧠' },
  { id: 'neon', name: 'Neon', emoji: '🌃' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'aurora', name: 'Aurora', emoji: '🌌' },
  { id: 'ember', name: 'Ember', emoji: '🔥' },
];

export const health = {
  systems: {
    graphify: { status: 'healthy', circuitState: { state: 'CLOSED', failures: 0 } },
    mcp: { status: 'healthy', circuitState: { state: 'CLOSED', failures: 0 } },
    sse: { status: 'healthy', connections: { totalClients: 3 } },
  },
};

function buildHistory() {
  const out: { date: string; knowledgeNodes: number; apiRequests: number; insights: number; brainScore: number }[] = [];
  const today = new Date();
  let nodes = 2400, req = 32000, ins = 1500, score = 78;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    nodes += Math.round(10 + Math.random() * 25);
    req += Math.round(300 + Math.random() * 700);
    ins += Math.round(8 + Math.random() * 18);
    score = Math.min(95, score + (Math.random() - 0.3) * 1.2);
    out.push({ date: d.toISOString().slice(0, 10), knowledgeNodes: nodes, apiRequests: req, insights: ins, brainScore: Math.round(score * 10) / 10 });
  }
  return out;
}

export const metrics = {
  knowledgeBase: { totalNodes: 2847, totalEdges: 156, growthRate: 12.4, syncHealth: 98.5 },
  apiBrain: { totalRequests: 45230, avgLatencyMs: 45, errorRate: 0.02, uptimePercent: 99.97, circuitState: 'CLOSED' },
  secondaryBrain: { insightsGenerated: 1847, accuracyScore: 0.94, learningRate: 0.15 },
  improvement: {
    apiBrain: { score: 87, trend: 3.2 },
    secondaryBrain: { score: 82, trend: 5.1 },
    knowledgeGraph: { score: 91, trend: 1.8 },
    overall: { score: 87, trend: 3.4 },
  },
  history: buildHistory(),
};

export type GraphNode = {
  id: string; label: string;
  type: 'core' | 'brain' | 'platform' | 'site' | 'memory';
  status: 'healthy' | 'degraded' | 'offline';
  size: number; capacity: number;
  x?: number; y?: number; vx?: number; vy?: number;
};
export type GraphLink = { source: string; target: string; strength: number; traffic: number };

export const graph: { nodes: GraphNode[]; links: GraphLink[] } = {
  nodes: [
    { id: 'kb-core', label: 'KB Core', type: 'core', status: 'healthy', size: 2847, capacity: 78 },
    { id: 'api-brain', label: 'API Brain', type: 'brain', status: 'healthy', size: 45230, capacity: 62 },
    { id: 'secondary-brain', label: 'Secondary Brain', type: 'brain', status: 'healthy', size: 1847, capacity: 54 },
    { id: 'graphify', label: 'Graphify', type: 'platform', status: 'healthy', size: 1200, capacity: 71 },
    { id: 'mcp-claude', label: 'MCP Claude', type: 'platform', status: 'healthy', size: 980, capacity: 48 },
    { id: 'vercel-api', label: 'Vercel API', type: 'platform', status: 'healthy', size: 8400, capacity: 33 },
    { id: 'site-1', label: 'FinSurfing', type: 'site', status: 'healthy', size: 620, capacity: 45 },
    { id: 'site-2', label: 'Prompt-Eng', type: 'site', status: 'degraded', size: 410, capacity: 88 },
    { id: 'memory-space', label: 'Memory Space', type: 'memory', status: 'healthy', size: 1560, capacity: 60 },
    { id: 'skill-registry', label: 'Skill Registry', type: 'memory', status: 'healthy', size: 240, capacity: 22 },
  ],
  links: [
    { source: 'kb-core', target: 'api-brain', strength: 0.95, traffic: 3400 },
    { source: 'kb-core', target: 'secondary-brain', strength: 0.9, traffic: 2100 },
    { source: 'kb-core', target: 'memory-space', strength: 0.85, traffic: 1800 },
    { source: 'api-brain', target: 'graphify', strength: 0.8, traffic: 1200 },
    { source: 'api-brain', target: 'vercel-api', strength: 0.88, traffic: 2900 },
    { source: 'secondary-brain', target: 'mcp-claude', strength: 0.78, traffic: 880 },
    { source: 'secondary-brain', target: 'skill-registry', strength: 0.7, traffic: 320 },
    { source: 'graphify', target: 'site-1', strength: 0.72, traffic: 540 },
    { source: 'graphify', target: 'site-2', strength: 0.66, traffic: 410 },
    { source: 'mcp-claude', target: 'memory-space', strength: 0.6, traffic: 230 },
    { source: 'vercel-api', target: 'site-1', strength: 0.82, traffic: 1100 },
    { source: 'vercel-api', target: 'site-2', strength: 0.74, traffic: 760 },
    { source: 'memory-space', target: 'skill-registry', strength: 0.65, traffic: 180 },
    { source: 'api-brain', target: 'secondary-brain', strength: 0.7, traffic: 640 },
  ],
};

export const platforms = [
  { id: 'finsurfing', name: 'FinSurfing', emoji: '🏄', health: 96, latency: 42, status: 'healthy',
    endpoints: [{ path: '/api/quotes', method: 'GET', latency: 38, status: 200 }, { path: '/api/portfolio', method: 'POST', latency: 64, status: 200 }, { path: '/api/sync', method: 'PUT', latency: 121, status: 200 }] },
  { id: 'prompt-eng', name: 'Prompt-Eng', emoji: '🔮', health: 78, latency: 89, status: 'degraded',
    endpoints: [{ path: '/api/generate', method: 'POST', latency: 142, status: 200 }, { path: '/api/templates', method: 'GET', latency: 28, status: 200 }, { path: '/api/eval', method: 'POST', latency: 312, status: 503 }] },
  { id: 'graphify', name: 'Graphify', emoji: '⚙️', health: 99, latency: 24, status: 'healthy',
    endpoints: [{ path: '/api/nodes', method: 'GET', latency: 18, status: 200 }, { path: '/api/edges', method: 'POST', latency: 32, status: 200 }, { path: '/api/query', method: 'POST', latency: 41, status: 200 }] },
  { id: 'mcp', name: 'MCP', emoji: '🔌', health: 94, latency: 55, status: 'healthy',
    endpoints: [{ path: '/mcp/tools', method: 'GET', latency: 22, status: 200 }, { path: '/mcp/invoke', method: 'POST', latency: 88, status: 200 }, { path: '/mcp/stream', method: 'GET', latency: 0, status: 101 }] },
];

const flowMessages = [
  { platform: 'graphify', level: 'info', msg: 'node.create kb-doc-{id}' },
  { platform: 'api-brain', level: 'info', msg: 'request 200 POST /v1/embed ({lat}ms)' },
  { platform: 'mcp', level: 'info', msg: 'tool.invoke claude.search ok' },
  { platform: 'secondary', level: 'ok', msg: 'insight generated confidence=0.94' },
  { platform: 'webhook', level: 'warn', msg: 'rate-limit nearing threshold (82%)' },
  { platform: 'sse', level: 'info', msg: 'client.connect total={n}' },
  { platform: 'kb-core', level: 'ok', msg: 'edge.upsert strength=0.87' },
  { platform: 'vercel', level: 'info', msg: 'deploy.ready prod region=iad1' },
  { platform: 'graphify', level: 'error', msg: 'circuit.trip retry in 30s' },
];

export function generateFlowEntry() {
  const t = flowMessages[Math.floor(Math.random() * flowMessages.length)];
  const id = Math.random().toString(36).slice(2, 8);
  const lat = Math.round(20 + Math.random() * 180);
  const n = Math.floor(Math.random() * 10) + 1;
  return {
    id: crypto.randomUUID(),
    ts: new Date(),
    platform: t.platform,
    level: t.level,
    msg: t.msg.replace('{id}', id).replace('{lat}', String(lat)).replace('{n}', String(n)),
  };
}

const eventTypes = ['graphify', 'webhook', 'mcp', 'error'] as const;
export function generateEvent() {
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  return {
    id: crypto.randomUUID(), ts: new Date(), type, status: type === 'error' ? 'failed' : 'ok',
    payload: type === 'graphify' ? 'node.sync ok 12 deltas'
      : type === 'webhook' ? 'deploy.succeeded site=finsurfing'
      : type === 'mcp' ? 'tool=search.web latency=88ms'
      : 'circuit.trip service=prompt-eng',
  };
}

// MCP Servers — sourced from FinSurfing /api/agentic-os/mcps
export const mcpServers = [
  { id: 'claude', name: 'Claude Sonnet 4.6', protocol: 'HTTP/SSE', description: 'Primary AI reasoning engine (8 tools)', model: 'claude-sonnet-4-6', tools: 8, status: 'connected', color: '#6366f1' },
  { id: 'groq', name: 'Groq LLaMA 3.3 70B', protocol: 'HTTP', description: 'Fallback fast inference (3 tools)', model: 'llama-3.3-70b', tools: 3, status: 'conditional', color: '#10b981' },
  { id: 'finnhub', name: 'Finnhub Market Data', protocol: 'HTTP/WS', description: 'Real-time equity data + WS stream (5 tools)', model: 'quote/chart/search', tools: 5, status: 'conditional', color: '#f59e0b' },
  { id: 'fmp', name: 'FMP Financial Data', protocol: 'HTTP', description: 'Fundamentals + analyst ratings (4 tools)', model: 'analyst/earnings', tools: 4, status: 'conditional', color: '#22d3ee' },
  { id: 'fred', name: 'FRED Macro Data', protocol: 'HTTP', description: '14 macro series — rates, inflation, VIX, GDP', model: 'series/observations', tools: 14, status: 'conditional', color: '#a78bfa' },
  { id: 'edgar', name: 'SEC EDGAR', protocol: 'HTTP', description: 'Insider transactions — Form 4 filings (2 tools)', model: 'company/filings', tools: 2, status: 'connected', color: '#f97316' },
  { id: 'finra', name: 'FINRA Short Interest', protocol: 'HTTP', description: 'Short interest data by symbol (1 tool)', model: 'short-interest', tools: 1, status: 'connected', color: '#ec4899' },
  { id: 'reddit', name: 'Reddit Social Sentiment', protocol: 'HTTP', description: 'WSB + investing subreddits (2 tools)', model: 'hot/new/sentiment', tools: 2, status: 'connected', color: '#ff4500' },
  { id: 'binance', name: 'Binance WebSocket', protocol: 'WS', description: 'Crypto 24hr ticker stream (1 tool)', model: '24hrTicker', tools: 1, status: 'connected', color: '#f0b90b' },
  { id: 'postgres', name: 'PostgreSQL', protocol: 'TCP', description: 'Portfolio + auth database (6 tools)', model: 'pg', tools: 6, status: 'conditional', color: '#336791' },
];

// Skills — sourced from FinSurfing /api/agentic-os/skills + prompt-engineering /api/scout
export const skills = [
  { id: 'market-scanner', name: 'Market Scanner', endpoint: '/api/ai-brain/analyze', description: '5-agent scan across 30+ universes (stocks, ETFs, crypto)', tags: ['ai', 'scan', 'multi-agent'], status: 'active', source: 'finsurfing', runs: 1240 },
  { id: 'symbol-analyzer', name: 'Symbol Analyzer', endpoint: '/api/trading-analysis/analyze', description: 'Technical + AI signal analysis for any ticker', tags: ['ai', 'technical', 'signals'], status: 'active', source: 'finsurfing', runs: 892 },
  { id: 'advisory-engine', name: 'Advisory Engine', endpoint: '/api/recommendations', description: '10 investor personas × buy signals with conflict surfacing', tags: ['ai', 'personas', 'advisory'], status: 'active', source: 'finsurfing', runs: 634 },
  { id: 'social-sentiment', name: 'Social Sentiment', endpoint: '/api/market-intel', description: 'Real-time Reddit/WSB sentiment scoring', tags: ['alt-data', 'reddit', 'wsb'], status: 'active', source: 'finsurfing', runs: 445 },
  { id: 'macro-pulse', name: 'Macro Pulse', endpoint: '/api/macro/summary', description: '14 FRED series + regime assessment', tags: ['macro', 'fred', 'regime'], status: 'active', source: 'finsurfing', runs: 312 },
  { id: 'alt-data', name: 'Alt Data', endpoint: '/api/market-intel/alt', description: 'SEC Form 4 insider + FINRA short interest signals', tags: ['alt-data', 'edgar', 'finra'], status: 'active', source: 'finsurfing', runs: 221 },
  { id: 'marketpulse-copilot', name: 'MarketPulse Copilot', endpoint: '/api/copilot/chat', description: 'Agentic SSE chat — Claude + Groq + Codex', tags: ['chat', 'sse', 'copilot'], status: 'active', source: 'finsurfing', runs: 1840 },
  { id: 'agent-research', name: 'Agent Research', endpoint: '/api/agents/research', description: '5-agent parallel research orchestrator', tags: ['orchestration', 'parallel', 'research'], status: 'active', source: 'finsurfing', runs: 567 },
  { id: 'backtest-engine', name: 'Backtest Engine', endpoint: '/api/backtest', description: '4 strategies × 3 date ranges, sequential queue', tags: ['backtest', 'strategy', 'queue'], status: 'active', source: 'finsurfing', runs: 389 },
  { id: 'alert-ai-trigger', name: 'Alert → AI Trigger', endpoint: '/api/alerts/trigger', description: 'Price alert → AI analysis pipeline automation', tags: ['alerts', 'automation', 'trigger'], status: 'active', source: 'finsurfing', runs: 178 },
  { id: 'scout-discovery', name: 'Scout Discovery', endpoint: '/api/scout', description: 'Autonomous skill/agent generation for any topic using Claude', tags: ['generation', 'scaffold', 'claude'], status: 'active', source: 'prompt-eng', runs: 870 },
  { id: 'prompt-chat', name: 'Prompt Chat', endpoint: '/api/chat', description: 'Server-side Claude proxy — API keys never exposed to client', tags: ['chat', 'proxy', 'anthropic'], status: 'active', source: 'prompt-eng', runs: 2140 },
  { id: 'council', name: 'Council Engine', endpoint: '/api/council', description: '5-advisor AI decision engine — contrarian + first-principles perspectives', tags: ['council', 'decision', 'contrarian'], status: 'active', source: 'prompt-eng', runs: 634 },
  { id: 'optimizer', name: 'Prompt Optimizer', endpoint: '/api/optimize', description: '6 modes: Clarity, CoT, Few-Shot, Concise, XML Structured, System Prompt', tags: ['optimize', 'prompts', 'cot'], status: 'active', source: 'prompt-eng', runs: 1290 },
];

// Plugins
export const plugins = [
  { id: 'superpowers', name: 'Superpowers', subtitle: 'Planning + subagents', description: 'Intelligent planning mode with subagent spawning. Asks better questions as it goes.', version: 'v1.4.2', tag: 'Claude Code', status: 'active', icon: '🚀', color: '#6366f1' },
  { id: 'context7', name: 'Context7', subtitle: 'Doc search plugin', description: 'Documentation provider for AI agents. Find and read docs, use APIs properly.', version: 'v2.1.0', tag: 'Universal', status: 'active', icon: '📖', color: '#22d3ee' },
  { id: 'browser-agent', name: 'Browser Agent', subtitle: 'Web automation', description: 'Browser automation via Playwright. Navigate, scrape, interact with web pages.', version: 'v1.0.8', tag: 'MCP', status: 'active', icon: '🖥️', color: '#10b981' },
  { id: 'pr-reviewer', name: 'PR Reviewer', subtitle: 'Code review AI', description: 'Automated PR review with impact analysis. Uses graph context for deeper insights.', version: 'v1.2.1', tag: 'GitHub', status: 'active', icon: '🔀', color: '#f59e0b' },
  { id: 'vision-extract', name: 'Vision Extract', subtitle: 'Image to code', description: 'Convert screenshots and mockups into working code. Figma to React component.', version: 'v0.9.3', tag: 'Vision', status: 'update', icon: '👁️', color: '#a78bfa' },
];

// Agents — 5-agent architecture from FinSurfing /api/ai-brain + Supervisor
export const agents = [
  { id: 'fundamental', name: 'Fundamental Analyst', description: 'Earnings, valuations, balance sheet quality', status: 'active', icon: '📊' },
  { id: 'technical', name: 'Technical Analyst', description: 'Price trends, momentum, support/resistance', status: 'active', icon: '📈' },
  { id: 'sentiment', name: 'Sentiment Agent', description: 'News flow, positioning, social dominance', status: 'active', icon: '💬' },
  { id: 'macro', name: 'Macro Economist', description: 'Sector tailwinds + regime fit (14 FRED series)', status: 'active', icon: '🌐' },
  { id: 'risk', name: 'Risk Manager', description: 'Downside scenarios + concentration exposure', status: 'active', icon: '🛡️' },
  { id: 'supervisor', name: 'Supervisor', description: 'Contradiction engine — surfaces agent conflicts ≥25pt', status: 'active', icon: '🧠' },
];
