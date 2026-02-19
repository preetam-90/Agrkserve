'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

  const setPage = useCallback(
    (next: number) => {
      setPageState(Math.max(0, Math.min(next, total - 1)));
    },
    [total]
  );

  const value = useMemo(
    () => ({ page, setPage, total, setTotal }),
    [page, setPage, total, setTotal]
  );
  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}

export function MessageBranchContent({ children }: { children: ReactNode }) {
  const ctx = useContext(BranchContext);
  const nodes = Array.isArray(children) ? children : [children];

  useEffect(() => {
    if (!ctx) return;
    if (ctx.total !== nodes.length) {
      ctx.setTotal(nodes.length);
    }
  }, [ctx, nodes.length]);

  if (!ctx) return <>{children}</>;
  return <>{nodes[ctx.page] ?? null}</>;
}

function MessageBranchSelector({ children }: { children: ReactNode }) {
  return <div className="mt-2 flex items-center justify-end gap-1.5">{children}</div>;
}

function MessageBranchPrevious() {
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

function MessageBranchPage() {
  const ctx = useContext(BranchContext);
  if (!ctx) return null;

  return (
    <span className="text-xs text-white/60">
      {ctx.page + 1}/{ctx.total}
    </span>
  );
}

function MessageBranchNext() {
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

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 border-b border-emerald-400/20 pb-2 text-2xl font-bold text-emerald-300 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 border-b border-emerald-400/10 pb-1.5 text-xl font-semibold text-emerald-300/90 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-semibold text-emerald-200/80 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-3 text-base font-semibold text-emerald-200/70 first:mt-0">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-1.5 mt-3 text-sm font-semibold text-emerald-200/60 first:mt-0">{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1.5 mt-2 text-sm font-medium text-emerald-200/50 first:mt-0">{children}</h6>
  ),
  p: ({ children }) => <p className="mb-3 leading-7 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-emerald-400 underline decoration-emerald-400/30 underline-offset-2 transition-colors hover:text-emerald-300 hover:decoration-emerald-300/50"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 ml-1 list-none space-y-1.5 last:mb-0 [&_ul]:mb-0 [&_ul]:mt-1.5">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-1 list-none space-y-1.5 [counter-reset:item] last:mb-0 [&_ol]:mb-0 [&_ol]:mt-1.5">
      {children}
    </ol>
  ),
  li: ({ children, node }) => {
    const isOrdered = node?.position
      ? false
      : (node as unknown as { parentNode?: { tagName?: string } })?.parentNode?.tagName === 'ol';
    return (
      <li
        className={cn(
          'relative pl-5 leading-7',
          'before:absolute before:left-0 before:top-0 before:leading-7',
          isOrdered
            ? '[counter-increment:item] before:text-emerald-400/70 before:content-[counter(item)"."]'
            : 'before:text-emerald-400/60 before:content-["▸"]'
        )}
      >
        {children}
      </li>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-emerald-400/40 pl-4 italic text-zinc-300/90">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 text-sm leading-6 last:mb-0">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <code className={cn('font-mono text-[13px] text-emerald-100', className)}>{children}</code>
      );
    }
    return (
      <code className="rounded-md border border-emerald-500/15 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[13px] text-emerald-200">
        {children}
      </code>
    );
  },
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-white/15 bg-white/5">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
  tr: ({ children }) => <tr className="transition-colors hover:bg-white/[0.03]">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-emerald-300/80">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="px-3 py-2 text-zinc-200">{children}</td>,
  hr: () => <hr className="my-5 border-0 border-t border-white/10" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element -- markdown renders standard img tags
    <img
      src={src}
      alt={alt ?? ''}
      className="my-3 max-w-full rounded-lg border border-white/10"
      loading="lazy"
    />
  ),
  input: ({ checked, disabled, ...props }) => (
    <input
      {...props}
      checked={checked}
      disabled={disabled}
      type="checkbox"
      className="mr-2 accent-emerald-400"
      readOnly
    />
  ),
};

const remarkPlugins = [remarkGfm];

export function MessageResponse({ children }: { children: ReactNode }) {
  const content = useMemo(() => {
    if (typeof children === 'string') return children;
    if (children == null) return null;
    return null;
  }, [children]);

  if (content === null) {
    return <div className="whitespace-pre-wrap break-words">{children}</div>;
  }

  if (content.length === 0) {
    return null;
  }

  return (
    <div className="ai-markdown break-words">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
