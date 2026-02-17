'use client';

import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { createContext, useContext, useState, type ReactNode } from 'react';

const SourcesContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function Sources({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <SourcesContext.Provider value={{ open, setOpen }}>{children}</SourcesContext.Provider>;
}

export function SourcesTrigger({ count }: { count: number }) {
  const ctx = useContext(SourcesContext);
  if (!ctx) return null;

  return (
    <button
      className="mb-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/75 transition hover:bg-white/[0.08] hover:text-white"
      onClick={() => ctx.setOpen(!ctx.open)}
      type="button"
    >
      <LinkIcon className="size-3" />
      Sources ({count})
    </button>
  );
}

export function SourcesContent({ children }: { children: ReactNode }) {
  const ctx = useContext(SourcesContext);
  if (!ctx?.open) return null;

  return <div className="mb-2 space-y-1 rounded-xl border border-white/10 bg-black/25 p-2">{children}</div>;
}

export function Source({ href, title }: { href: string; title: string }) {
  return (
    <a
      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-emerald-200 transition hover:bg-white/[0.07] hover:text-emerald-100"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      <ExternalLink className="size-3" />
      <span className="truncate">{title}</span>
    </a>
  );
}
