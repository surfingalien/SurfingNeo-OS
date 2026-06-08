import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'SurfingNeo-OS · Neural Mesh Dashboard',
  description: 'Real-time visualization of the SurfingNeo-OS agentic network — Knowledge Base, API Brain, FinSurfing, Prompt Engineering platforms',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; background: #070710; color: #e0e0e0; font-family: system-ui, -apple-system, sans-serif; }
          ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0f; } ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 2px; }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
          @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
