'use client';

import { Brain, ChevronDown } from 'lucide-react';
import { createContext, useContext, useState, type ReactNode } from 'react';

const ReasoningContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(
  null
);

export function Reasoning({ children }: { children: ReactNode; duration?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <ReasoningContext.Provider value={{ open, setOpen }}>{children}</ReasoningContext.Provider>
  );
}

export function ReasoningTrigger() {
  const ctx = useContext(ReasoningContext);
  if (!ctx) return null;

  return (
    <button
      className="mb-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/75 transition hover:bg-white/[0.08] hover:text-white"
      onClick={() => ctx.setOpen(!ctx.open)}
      type="button"
    >
      <Brain className="size-3" />
      Reasoning
      <ChevronDown className={`size-3 transition ${ctx.open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function ReasoningContent({ children }: { children: ReactNode }) {
  const ctx = useContext(ReasoningContext);
  if (!ctx?.open) return null;

  return (
    <div className="mb-2 rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-6 text-white/80">
      {children}
    </div>
  );
}
