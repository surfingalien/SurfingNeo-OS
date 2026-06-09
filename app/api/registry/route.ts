import { NextRequest, NextResponse } from 'next/server';
import { mcpServers, skills } from '@/lib/neo-mock';

export const dynamic = 'force-dynamic';

const FS = 'https://finsurfing-production.up.railway.app';
const PE = 'https://prompt-engineering-production-67f2.up.railway.app';
const TIMEOUT = 7000;

async function safeFetch(url: string) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT),
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// Normalize a raw MCP server record from FinSurfing into our internal shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMcp(raw: any, index: number) {
  const id = raw.id ?? raw.name?.toLowerCase().replace(/\s+/g, '-') ?? `mcp-${index}`;
  return {
    id,
    name: raw.name ?? raw.label ?? id,
    protocol: raw.protocol ?? raw.transport ?? 'HTTP',
    description: raw.description ?? raw.desc ?? '',
    model: raw.model ?? raw.modelId ?? raw.version ?? '',
    tools: typeof raw.tools === 'number' ? raw.tools : Array.isArray(raw.tools) ? raw.tools.length : (raw.toolCount ?? 0),
    status: raw.status ?? raw.state ?? 'connected',
    color: raw.color ?? '#6366f1',
  };
}

// Normalize a raw skill record into our internal shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeSkill(raw: any, source: 'finsurfing' | 'prompt-eng', index: number) {
  const id = raw.id ?? raw.name?.toLowerCase().replace(/\s+/g, '-') ?? `skill-${source}-${index}`;
  return {
    id,
    name: raw.name ?? raw.label ?? id,
    endpoint: raw.endpoint ?? raw.path ?? raw.url ?? '',
    description: raw.description ?? raw.desc ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags : (raw.tag ? [raw.tag] : []),
    status: raw.status ?? raw.state ?? 'active',
    source,
    runs: typeof raw.runs === 'number' ? raw.runs : (raw.runCount ?? raw.callCount ?? 0),
  };
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') ?? 'all';

  let liveMcps = null;
  let fsSkills = null;
  let peSkills = null;

  // Fetch in parallel
  const [fsMcpRaw, fsSkillsRaw, peScoutRaw] = await Promise.all([
    type !== 'skills' ? safeFetch(`${FS}/api/agentic-os/mcps`) : Promise.resolve(null),
    type !== 'mcps'   ? safeFetch(`${FS}/api/agentic-os/skills`) : Promise.resolve(null),
    type !== 'mcps'   ? safeFetch(`${PE}/api/scout/skills`) : Promise.resolve(null),
  ]);

  // Normalize MCPs
  if (fsMcpRaw) {
    const arr = Array.isArray(fsMcpRaw) ? fsMcpRaw : (fsMcpRaw.mcps ?? fsMcpRaw.servers ?? fsMcpRaw.data ?? []);
    if (arr.length > 0) liveMcps = arr.map(normalizeMcp);
  }

  // Normalize FinSurfing skills
  if (fsSkillsRaw) {
    const arr = Array.isArray(fsSkillsRaw) ? fsSkillsRaw : (fsSkillsRaw.skills ?? fsSkillsRaw.data ?? []);
    if (arr.length > 0) fsSkills = arr.map((s: unknown, i: number) => normalizeSkill(s, 'finsurfing', i));
  }

  // Normalize PromptForge skills (try /api/scout/skills, fallback to /api/scout)
  let peRaw = peScoutRaw;
  if (!peRaw) peRaw = await safeFetch(`${PE}/api/scout`);
  if (peRaw) {
    const arr = Array.isArray(peRaw) ? peRaw : (peRaw.skills ?? peRaw.data ?? peRaw.agents ?? []);
    if (arr.length > 0) peSkills = arr.map((s: unknown, i: number) => normalizeSkill(s, 'prompt-eng', i));
  }

  const mcps = liveMcps ?? mcpServers;
  const skillsList = [
    ...(fsSkills ?? skills.filter(s => s.source === 'finsurfing')),
    ...(peSkills ?? skills.filter(s => s.source === 'prompt-eng')),
  ];

  // Deduplicate by id (live takes precedence over mock)
  const deduped = Array.from(
    new Map(skillsList.map(s => [s.id, s])).values()
  );

  return NextResponse.json({
    mcps,
    skills: deduped,
    meta: {
      lastSynced: new Date().toISOString(),
      mcpSource: liveMcps ? 'live' : 'fallback',
      fsSkillsSource: fsSkills ? 'live' : 'fallback',
      peSkillsSource: peSkills ? 'live' : 'fallback',
      mcpCount: mcps.length,
      skillCount: deduped.length,
    },
  });
}
