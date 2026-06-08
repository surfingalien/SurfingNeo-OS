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

// MCP Servers
export const mcpServers = [
  { id: 'claude', name: 'Claude claude-sonnet-4-6', protocol: 'HTTP/SSE', description: 'Primary AI reasoning + tool use', model: 'claude-sonnet-4-6', tools: 8, status: 'connected', color: '#6366f1' },
  { id: 'groq', name: 'Groq LLaMA 3.3 70B', protocol: 'HTTP', description: 'Fallback fast inference', model: 'llama-3.3-70b', tools: 3, status: 'connected', color: '#10b981' },
  { id: 'finnhub', name: 'Finnhub Market Data', protocol: 'HTTP', description: 'Real-time US equity data', model: 'quote/chart/search', tools: 5, status: 'connected', color: '#f59e0b' },
  { id: 'fmp', name: 'FMP Financial Data', protocol: 'HTTP', description: 'Fundamentals + analyst ratings', model: 'analyst/earnings', tools: 4, status: 'connected', color: '#22d3ee' },
  { id: 'fred', name: 'FRED Macro Data', protocol: 'HTTP', description: 'Rates, inflation, VIX, GDP', model: 'series/observations', tools: 4, status: 'connected', color: '#a78bfa' },
  { id: 'edgar', name: 'SEC EDGAR', protocol: 'HTTP', description: 'Insider transactions (free)', model: 'company/filings', tools: 3, status: 'connected', color: '#f97316' },
  { id: 'alpaca', name: 'Alpaca Trading', protocol: 'HTTP/WS', description: 'Paper + live order execution', model: 'orders/positions', tools: 6, status: 'connected', color: '#ec4899' },
  { id: 'reddit', name: 'Reddit Sentiment', protocol: 'HTTP', description: 'WSB + investing subreddits', model: 'hot/new/sentiment', tools: 2, status: 'connected', color: '#ff4500' },
  { id: 'newsapi', name: 'NewsAPI', protocol: 'HTTP', description: 'Financial news aggregation', model: 'everything/headlines', tools: 2, status: 'degraded', color: '#94a3b8' },
  { id: 'openbb', name: 'OpenBB Platform', protocol: 'HTTP', description: 'Multi-source terminal data', model: 'equity/options', tools: 7, status: 'disconnected', color: '#475569' },
];

// Skills
export const skills = [
  { id: 'market-scanner', name: 'Market Scanner', endpoint: '/api/ai-brain/analyze', description: 'AI Brain 5-agent scan across 30+ universes', tags: ['ai', 'scan', 'multi-agent'], status: 'active', source: 'finsurfing', runs: 1240 },
  { id: 'symbol-analyzer', name: 'Symbol Analyzer', endpoint: '/api/trading-analysis', description: 'Deep technical + AI signal for any ticker', tags: ['ai', 'technical', 'signals'], status: 'active', source: 'finsurfing', runs: 892 },
  { id: 'advisory-engine', name: 'Advisory Engine', endpoint: '/api/recommendations', description: '10 investor personas × buy signals', tags: ['ai', 'personas', 'advisory'], status: 'active', source: 'finsurfing', runs: 634 },
  { id: 'social-sentiment', name: 'Social Sentiment', endpoint: '/api/market-intel', description: 'Real-time Reddit/WSB sentiment scoring', tags: ['alt-data', 'reddit', 'wsb'], status: 'active', source: 'finsurfing', runs: 445 },
  { id: 'risk-scorer', name: 'Risk Scorer', endpoint: '/api/risk/score', description: 'VaR + portfolio concentration risk', tags: ['risk', 'portfolio'], status: 'active', source: 'finsurfing', runs: 318 },
  { id: 'earnings-tracker', name: 'Earnings Tracker', endpoint: '/api/earnings', description: 'Pre/post earnings drift detection', tags: ['earnings', 'catalyst'], status: 'active', source: 'finsurfing', runs: 221 },
  { id: 'prompt-optimizer', name: 'Prompt Optimizer', endpoint: '/api/prompt/optimize', description: 'Token-efficient prompt rewriting', tags: ['llm', 'tokens', 'optimization'], status: 'active', source: 'prompt-eng', runs: 870 },
  { id: 'chain-executor', name: 'Chain Executor', endpoint: '/api/chain/execute', description: 'Multi-step LLM pipeline runner', tags: ['chain', 'pipeline', 'llm'], status: 'active', source: 'prompt-eng', runs: 680 },
  { id: 'template-engine', name: 'Template Engine', endpoint: '/api/template/render', description: 'Dynamic prompt template library', tags: ['templates', 'render'], status: 'active', source: 'prompt-eng', runs: 1540 },
  { id: 'eval-runner', name: 'Eval Runner', endpoint: '/api/eval/run', description: 'LLM output quality benchmarking', tags: ['eval', 'benchmark', 'quality'], status: 'inactive', source: 'prompt-eng', runs: 480 },
  { id: 'context-compressor', name: 'Context Compressor', endpoint: '/api/context/compress', description: 'Intelligent context window management', tags: ['context', 'compression'], status: 'active', source: 'prompt-eng', runs: 290 },
  { id: 'rag-pipeline', name: 'RAG Pipeline', endpoint: '/api/rag/query', description: 'Retrieval-augmented generation with Graphify', tags: ['rag', 'retrieval', 'graphify'], status: 'active', source: 'prompt-eng', runs: 567 },
];

// Plugins
export const plugins = [
  { id: 'superpowers', name: 'Superpowers', subtitle: 'Planning + subagents', description: 'Intelligent planning mode with subagent spawning. Asks better questions as it goes.', version: 'v1.4.2', tag: 'Claude Code', status: 'active', icon: '🚀', color: '#6366f1' },
  { id: 'context7', name: 'Context7', subtitle: 'Doc search plugin', description: 'Documentation provider for AI agents. Find and read docs, use APIs properly.', version: 'v2.1.0', tag: 'Universal', status: 'active', icon: '📖', color: '#22d3ee' },
  { id: 'browser-agent', name: 'Browser Agent', subtitle: 'Web automation', description: 'Browser automation via Playwright. Navigate, scrape, interact with web pages.', version: 'v1.0.8', tag: 'MCP', status: 'active', icon: '🖥️', color: '#10b981' },
  { id: 'pr-reviewer', name: 'PR Reviewer', subtitle: 'Code review AI', description: 'Automated PR review with impact analysis. Uses graph context for deeper insights.', version: 'v1.2.1', tag: 'GitHub', status: 'active', icon: '🔀', color: '#f59e0b' },
  { id: 'vision-extract', name: 'Vision Extract', subtitle: 'Image to code', description: 'Convert screenshots and mockups into working code. Figma to React component.', version: 'v0.9.3', tag: 'Vision', status: 'update', icon: '👁️', color: '#a78bfa' },
];

// Agents
export const agents = [
  { id: 'coder', name: 'Coder Agent', description: 'Implementing features', status: 'active', icon: '</>' },
  { id: 'research', name: 'Research Agent', description: 'Searching Graphify docs', status: 'active', icon: '🔍' },
  { id: 'review', name: 'Review Agent', description: 'Idle — awaiting PR', status: 'idle', icon: '✔' },
];
