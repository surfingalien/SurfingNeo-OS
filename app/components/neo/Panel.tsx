'use client';
import type { ReactNode } from 'react';

export function Panel({ title, icon, action, children, className = '' }: {
  title?: string; icon?: ReactNode; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-xl neo-glass overflow-hidden ${className}`}>
      {title && (
        <header className="flex items-center justify-between px-4 h-10 border-b border-[var(--neo-border)]">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--neo-muted)]">
            {icon}<span>{title}</span>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
