import type { Metadata, Viewport } from 'next';
import './neo.css';

export const metadata: Metadata = {
  title: 'SurfingNeo-OS · Neural Mesh Control Center',
  description: 'Real-time AI operations dashboard — Knowledge Graph, API Brain, FinSurfing, Prompt Engineering platforms',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
