'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BranchCtx = {
  page: number;
  setPage: (next: number) => void;
  total: number;
  setTotal: (total: number) => void;
};

const BranchContext = createContext<BranchCtx | null>(null);

export function MessageBranch({
  children,
  defaultBranch = 0,
}: {
  children: ReactNode;
  defaultBranch?: number;
}) {
  const [page, setPageState] = useState(defaultBranch);
  const [total, setTotal] = useState(1);

  const setPage = (next: number) => {
    setPageState(Math.max(0, Math.min(next, total - 1)));
  };

  const value = { page, setPage, total, setTotal };
  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function MessageBranchContent({ children }: { children: ReactNode }) {
  const ctx = useContext(BranchContext);
  const nodes = Array.isArray(children) ? children : [children];

  useEffect(() => {
    if (ctx && ctx.total !== nodes.length) {
      ctx.setTotal(nodes.length);
    }
  }, [ctx, nodes.length]);

  if (!ctx) return <>{children}</>;
  return <>{nodes[ctx.page] ?? null}</>;
}

export function MessageBranchSelector({ children }: { children: ReactNode }) {
  return <div className="mt-2 flex items-center justify-end gap-1.5">{children}</div>;
}

export function MessageBranchPrevious() {
  const ctx = useContext(BranchContext);
  if (!ctx) return null;

  return (
    <button
      className="rounded-md border border-white/15 bg-black/30 px-2 py-0.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
      onClick={() => ctx.setPage(ctx.page - 1)}
      type="button"
    >
      Prev
    </button>
  );
}

export function MessageBranchPage() {
  const ctx = useContext(BranchContext);
  if (!ctx) return null;

  return (
    <span className="text-xs text-white/60">
      {ctx.page + 1}/{ctx.total}
    </span>
  );
}

export function MessageBranchNext() {
  const ctx = useContext(BranchContext);
  if (!ctx) return null;

  return (
    <button
      className="rounded-md border border-white/15 bg-black/30 px-2 py-0.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
      onClick={() => ctx.setPage(ctx.page + 1)}
      type="button"
    >
      Next
    </button>
  );
}

export function Message({ children, from }: { children: ReactNode; from: 'user' | 'assistant' }) {
  return (
    <article
      className={cn(
        'animate-messageIn flex w-full',
        from === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[90%] rounded-2xl border px-4 py-3 text-[15px] leading-7 shadow-md md:max-w-[78%]',
          from === 'user'
            ? 'border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-cyan-500/15 text-emerald-50'
            : 'border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] text-zinc-100 backdrop-blur'
        )}
      >
        {children}
      </div>
    </article>
  );
}

export function MessageContent({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function MessageResponse({ children }: { children: ReactNode }) {
  return <div className="whitespace-pre-wrap break-words">{children}</div>;
}
