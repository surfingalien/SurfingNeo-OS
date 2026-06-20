---
name: surfingneo-os
description: Development skill for the SurfingNeo-OS neural mesh control center. Covers adding views, API routes, graph enhancements, and component patterns for this Next.js 14 + Graphify Express stack.
---

# SurfingNeo-OS Development Skill

## Stack
- Next.js 14 App Router, React 18, TypeScript
- Graphify Express server (port 3001) — knowledge graph
- Framer Motion (animations), Recharts (charts), lucide-react (icons)
- Tailwind CSS + CSS variables for theming

## Adding a View (checklist)
1. Add view ID to `View` type in `Dashboard.tsx` AND `Sidebar.tsx`
2. Add nav item to `NAV_ITEMS` in `Sidebar.tsx`
3. Add `{view === 'id' && <MyPage />}` render in `Dashboard.tsx`
4. Create `app/components/neo/MyPage.tsx` — export named function

## Component Pattern
```tsx
'use client';
import { Panel } from './Panel';

export function MyPage() {
  return (
    <div className="neo-page-padding">
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--neo-text)' }}>Title</h1>
      <Panel title="Section">...</Panel>
    </div>
  );
}
```

## API Route Pattern
```ts
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth/middleware';
export async function GET(req: Request) {
  const auth = await verifyAuth(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ data: 'result' });
}
```

## Theme Colors (always use CSS vars — never hardcode)
- `var(--neo-primary)` — accent (indigo-ish)
- `var(--neo-secondary)` — secondary accent
- `var(--neo-text)` — primary text
- `var(--neo-muted)` — muted text
- `var(--neo-faint)` — very muted / labels
- `var(--neo-bg)` — background
- `var(--neo-border)` — borders

## Graphify Circuit Breaker
All Graphify calls go through `CircuitBreaker`. On failure the dashboard degrades to mock data — never remove this pattern.

## Design Principles (from taste-skill)
- VARIANCE dial 7: moderate asymmetry, avoid cookie-cutter equal-width grid
- MOTION dial 6: purposeful transitions, not constant animation
- DENSITY dial 4: breathable but information-dense
- No hardcoded AI-purple gradients; use CSS theme vars
- One design system (Tailwind + CSS vars + shadcn primitives) — do not mix
