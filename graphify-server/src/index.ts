import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || 'dev-key';

app.use(helmet());
app.use(cors());
app.use(express.json());

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const key = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.headers['x-api-key'];
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized', code: 'INVALID_API_KEY' });
  }
  next();
};

interface KnowledgeNode {
  id: string;
  label: string;
  type: 'brain' | 'engine' | 'interface' | 'infrastructure' | 'source' | 'storage' | 'concept' | 'entity';
  status: 'active' | 'warning' | 'error' | 'inactive';
  edges: number;
  size: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface KnowledgeLink {
  id: string;
  source: string;
  target: string;
  strength: number;
  type: 'bidirectional' | 'unidirectional' | 'hierarchical';
  traffic: number;
  label?: string;
  metadata: Record<string, any>;
}

interface DailyMetric {
  date: string;
  knowledgeNodes: number;
  knowledgeEdges: number;
  apiRequests: number;
  apiLatencyMs: number;
  apiErrors: number;
  // NOTE: field is `insightsGenerated` here; dashboard normalizes to `insights`
  insightsGenerated: number;
  insightAccuracy: number;
  brainScore: number;
}

const nodes: Map<string, KnowledgeNode> = new Map([
  ['kb-core', { id: 'kb-core', label: 'Knowledge Base Core', type: 'brain', status: 'active', edges: 12, size: 2847, metadata: { description: 'Central knowledge repository', owner: 'system' }, createdAt: '2024-01-01T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['api-brain', { id: 'api-brain', label: 'API Brain', type: 'brain', status: 'active', edges: 8, size: 1563, metadata: { description: 'Vercel API layer', version: '2.1.0' }, createdAt: '2024-01-15T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['secondary-brain', { id: 'secondary-brain', label: 'Secondary Brain', type: 'brain', status: 'active', edges: 6, size: 982, metadata: { description: 'Claude MCP insights layer', model: 'claude-3-sonnet' }, createdAt: '2024-02-01T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['graphify', { id: 'graphify', label: 'Graphify Engine', type: 'engine', status: 'active', edges: 15, size: 5120, metadata: { description: 'Graph processing engine', version: '3.2.1' }, createdAt: '2024-01-01T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['mcp-claude', { id: 'mcp-claude', label: 'Claude MCP', type: 'interface', status: 'active', edges: 4, size: 320, metadata: { description: 'Model Context Protocol server' }, createdAt: '2024-03-01T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['vercel-api', { id: 'vercel-api', label: 'Vercel API Layer', type: 'infrastructure', status: 'active', edges: 10, size: 890, metadata: { description: 'Serverless functions', region: 'iad1' }, createdAt: '2024-01-10T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['site-1', { id: 'site-1', label: 'Production Website', type: 'source', status: 'active', edges: 3, size: 445, metadata: { url: process.env.SITE1_URL || 'https://example.com', lastCrawl: new Date().toISOString() }, createdAt: '2024-01-20T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['site-2', { id: 'site-2', label: 'Staging Website', type: 'source', status: 'active', edges: 2, size: 210, metadata: { url: process.env.SITE2_URL || 'https://staging.example.com', lastCrawl: new Date().toISOString() }, createdAt: '2024-02-10T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['memory-space', { id: 'memory-space', label: 'Memory Space', type: 'storage', status: 'active', edges: 5, size: 1200, metadata: { description: 'Conversation memory store', entries: 342 }, createdAt: '2024-01-05T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['skill-registry', { id: 'skill-registry', label: 'SKILL.md Registry', type: 'storage', status: 'active', edges: 7, size: 650, metadata: { description: 'Agent skill definitions', skills: 12 }, createdAt: '2024-01-08T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['user-1', { id: 'user-1', label: 'User Preferences', type: 'entity', status: 'active', edges: 3, size: 45, metadata: { userId: 'user-1', preferences: { theme: 'dark' } }, createdAt: '2024-03-15T00:00:00Z', updatedAt: new Date().toISOString() }],
  ['concept-1', { id: 'concept-1', label: 'Agentic OS Pattern', type: 'concept', status: 'active', edges: 5, size: 180, metadata: { domain: 'architecture', confidence: 0.94 }, createdAt: '2024-02-20T00:00:00Z', updatedAt: new Date().toISOString() }],
]);

const links: Map<string, KnowledgeLink> = new Map([
  ['l1', { id: 'l1', source: 'kb-core', target: 'api-brain', strength: 0.95, type: 'bidirectional', traffic: 1240, label: 'queries', metadata: { latencyMs: 45 } }],
  ['l2', { id: 'l2', source: 'api-brain', target: 'secondary-brain', strength: 0.88, type: 'bidirectional', traffic: 856, label: 'insights', metadata: { latencyMs: 120 } }],
  ['l3', { id: 'l3', source: 'kb-core', target: 'graphify', strength: 0.92, type: 'bidirectional', traffic: 2100, label: 'processing', metadata: { latencyMs: 30 } }],
  ['l4', { id: 'l4', source: 'api-brain', target: 'graphify', strength: 0.85, type: 'bidirectional', traffic: 1680, label: 'queries', metadata: { latencyMs: 50 } }],
  ['l5', { id: 'l5', source: 'secondary-brain', target: 'graphify', strength: 0.78, type: 'bidirectional', traffic: 920, label: 'analysis', metadata: { latencyMs: 200 } }],
  ['l6', { id: 'l6', source: 'api-brain', target: 'mcp-claude', strength: 0.90, type: 'bidirectional', traffic: 640, label: 'tool calls', metadata: { latencyMs: 300 } }],
  ['l7', { id: 'l7', source: 'vercel-api', target: 'api-brain', strength: 0.82, type: 'unidirectional', traffic: 3400, label: 'requests', metadata: { latencyMs: 25 } }],
  ['l8', { id: 'l8', source: 'vercel-api', target: 'graphify', strength: 0.75, type: 'unidirectional', traffic: 2800, label: 'queries', metadata: { latencyMs: 40 } }],
  ['l9', { id: 'l9', source: 'site-1', target: 'vercel-api', strength: 0.70, type: 'unidirectional', traffic: 560, label: 'webhooks', metadata: { events: ['data_change', 'deploy'] } }],
  ['l10', { id: 'l10', source: 'site-2', target: 'vercel-api', strength: 0.65, type: 'unidirectional', traffic: 320, label: 'webhooks', metadata: { events: ['data_change'] } }],
  ['l11', { id: 'l11', source: 'memory-space', target: 'kb-core', strength: 0.80, type: 'bidirectional', traffic: 430, label: 'memories', metadata: { syncInterval: '5m' } }],
  ['l12', { id: 'l12', source: 'skill-registry', target: 'api-brain', strength: 0.72, type: 'unidirectional', traffic: 210, label: 'skills', metadata: { version: '1.0' } }],
  ['l13', { id: 'l13', source: 'skill-registry', target: 'mcp-claude', strength: 0.65, type: 'bidirectional', traffic: 180, label: 'tools', metadata: { version: '1.0' } }],
  ['l14', { id: 'l14', source: 'mcp-claude', target: 'secondary-brain', strength: 0.60, type: 'unidirectional', traffic: 320, label: 'results', metadata: { latencyMs: 500 } }],
  ['l15', { id: 'l15', source: 'user-1', target: 'kb-core', strength: 0.55, type: 'bidirectional', traffic: 89, label: 'preferences', metadata: {} }],
  ['l16', { id: 'l16', source: 'concept-1', target: 'kb-core', strength: 0.70, type: 'hierarchical', traffic: 156, label: 'belongs_to', metadata: { confidence: 0.94 } }],
]);

const history: DailyMetric[] = [];
const now = new Date();
for (let i = 89; i >= 0; i--) {
  const date = new Date(now);
  date.setDate(date.getDate() - i);
  history.push({
    date: date.toISOString().split('T')[0],
    knowledgeNodes: 1500 + (89 - i) * 15 + Math.floor(Math.random() * 20),
    knowledgeEdges: 80 + (89 - i) * 1 + Math.floor(Math.random() * 5),
    apiRequests: 800 + (89 - i) * 45 + Math.floor(Math.random() * 200),
    apiLatencyMs: 40 + Math.floor(Math.random() * 30),
    apiErrors: Math.floor(Math.random() * 5),
    insightsGenerated: 20 + (89 - i) * 2 + Math.floor(Math.random() * 8),
    insightAccuracy: 0.85 + (89 - i) * 0.001 + Math.random() * 0.05,
    brainScore: 60 + (89 - i) * 0.3 + Math.random() * 3,
  });
}

let requestCount = 45230;
let insightCount = 1847;
const requestLog: { timestamp: string; method: string; path: string; latencyMs: number; status: number }[] = [];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.post('/query', authenticate, (req, res) => {
  const start = Date.now();
  const { query, projectId } = req.body;
  const results = Array.from(nodes.values())
    .filter(n => !query || n.label.toLowerCase().includes(query.toLowerCase()) || n.type.includes(query.toLowerCase()))
    .slice(0, 20);
  requestCount++;
  const latency = Date.now() - start;
  requestLog.push({ timestamp: new Date().toISOString(), method: 'POST', path: '/query', latencyMs: latency, status: 200 });
  res.json({ success: true, query, projectId, results, resultCount: results.length, processingTimeMs: latency, timestamp: new Date().toISOString() });
});

app.post('/ingest', authenticate, (req, res) => {
  const start = Date.now();
  const data = req.body;
  const nodeId = `ingested-${uuidv4().slice(0, 8)}`;
  const newNode: KnowledgeNode = {
    id: nodeId,
    label: data.title || data.name || `Ingested ${data._meta?.eventType || 'data'}`,
    type: data._meta?.siteName ? 'source' : 'entity',
    status: 'active',
    edges: 0,
    size: JSON.stringify(data).length,
    metadata: { ...data, ingestedAt: new Date().toISOString() },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  nodes.set(nodeId, newNode);
  if (data.projectId) {
    const linkId = `link-${uuidv4().slice(0, 8)}`;
    links.set(linkId, { id: linkId, source: nodeId, target: data.projectId, strength: 0.6, type: 'unidirectional', traffic: 1, label: 'project_data', metadata: { ingested: true } });
  }
  requestCount++;
  const latency = Date.now() - start;
  requestLog.push({ timestamp: new Date().toISOString(), method: 'POST', path: '/ingest', latencyMs: latency, status: 200 });
  res.json({ success: true, nodeId, nodesTotal: nodes.size, linksTotal: links.size, processingTimeMs: latency, timestamp: new Date().toISOString() });
});

app.get('/graph/topology', authenticate, (_req, res) => {
  const nodeList = Array.from(nodes.values()).map(n => ({ id: n.id, label: n.label, type: n.type, status: n.status, edges: n.edges, size: n.size, metadata: n.metadata }));
  const linkList = Array.from(links.values()).map(l => ({ source: l.source, target: l.target, strength: l.strength, type: l.type, traffic: l.traffic, label: l.label }));
  res.json({ nodes: nodeList, links: linkList, meta: { totalNodes: nodeList.length, totalLinks: linkList.length, generatedAt: new Date().toISOString(), source: 'graphify-live' } });
});

app.get('/graph/node/:id', authenticate, (req, res) => {
  const node = nodes.get(req.params.id);
  if (!node) return res.status(404).json({ error: 'Node not found' });
  const connectedLinks = Array.from(links.values()).filter(l => l.source === req.params.id || l.target === req.params.id);
  const connectedNodes = connectedLinks.map(l => nodes.get(l.source === req.params.id ? l.target : l.source)).filter(Boolean);
  res.json({ node, connections: { links: connectedLinks, nodes: connectedNodes, count: connectedLinks.length }, timestamp: new Date().toISOString() });
});

app.get('/metrics/summary', authenticate, (_req, res) => {
  const nowMs = Date.now();
  const recentRequests = requestLog.filter(r => new Date(r.timestamp).getTime() > nowMs - 86400000);
  const avgLatency = recentRequests.length > 0 ? recentRequests.reduce((sum, r) => sum + r.latencyMs, 0) / recentRequests.length : 45;
  const errorCount = recentRequests.filter(r => r.status >= 500).length;
  const errorRate = recentRequests.length > 0 ? errorCount / recentRequests.length : 0.02;
  const lastWeek = history.slice(-7);
  const prevWeek = history.slice(-14, -7);
  const brainTrend = lastWeek.reduce((s, d) => s + d.brainScore, 0) / 7 - prevWeek.reduce((s, d) => s + d.brainScore, 0) / 7;

  res.json({
    timestamp: new Date().toISOString(),
    source: 'graphify-live',
    knowledgeBase: { totalNodes: nodes.size, totalEdges: links.size, growthRate: 12.4, lastIngestion: Array.from(nodes.values()).pop()?.createdAt || new Date().toISOString(), syncHealth: 98.5 },
    apiBrain: { totalRequests: requestCount, avgLatencyMs: Math.round(avgLatency), p99LatencyMs: Math.round(avgLatency * 2.5), errorRate: Math.round(errorRate * 100) / 100, uptimePercent: 99.97, circuitBreaks: 0, circuitState: 'CLOSED' },
    secondaryBrain: { insightsGenerated: insightCount, accuracyScore: 0.94, learningRate: 0.15, modelVersion: 'claude-3-sonnet-20240229', lastTraining: new Date(nowMs - 86400000).toISOString() },
    connections: { activeWebhooks: 2, sseClients: 0, mcpToolsAvailable: 4, mcpInvocationsToday: Math.floor(Math.random() * 50) + 100, mcpCircuitState: 'CLOSED' },
    improvement: {
      apiBrain: { score: 87, trend: +3.2, label: 'Improving' },
      secondaryBrain: { score: 82, trend: +5.1, label: 'Accelerating' },
      knowledgeGraph: { score: 91, trend: +1.8, label: 'Stable Growth' },
      overall: { score: Math.round(87 + brainTrend), trend: Math.round(brainTrend * 10) / 10, label: brainTrend > 0 ? 'Strong' : 'Stable' },
    },
    history: history.slice(-30),
  });
});

app.get('/metrics/history', authenticate, (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  res.json({ days, data: history.slice(-days), generatedAt: new Date().toISOString() });
});

app.get('/metrics/realtime', authenticate, (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    counters: { totalNodes: nodes.size, totalLinks: links.size, totalRequests: requestCount, totalInsights: insightCount, requestsLastMinute: requestLog.filter(r => new Date(r.timestamp).getTime() > Date.now() - 60000).length },
  });
});

app.post('/insights/generate', authenticate, (req, res) => {
  const { projectId, dataSources, insightType } = req.body;
  insightCount++;
  res.json({
    projectId, insightType,
    generated: [
      { type: 'trend', message: `Knowledge graph grew by ${Math.floor(Math.random() * 20 + 5)} nodes today`, confidence: 0.92 },
      { type: 'anomaly', message: 'API latency spike detected at 14:32 UTC', confidence: 0.88 },
      { type: 'recommendation', message: 'Consider adding caching layer for repeated queries', confidence: 0.85 },
    ].filter(() => Math.random() > 0.3),
    generatedAt: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Graphify Server running on port ${PORT}`);
  console.log(`   POST /query              — Query knowledge graph`);
  console.log(`   POST /ingest             — Ingest new data`);
  console.log(`   GET  /graph/topology     — Connection topology`);
  console.log(`   GET  /graph/node/:id     — Single node detail`);
  console.log(`   GET  /metrics/summary    — Brain health metrics`);
  console.log(`   GET  /metrics/history    — Historical data`);
  console.log(`   GET  /metrics/realtime   — Live counters`);
  console.log(`   POST /insights/generate  — Generate insights`);
});
