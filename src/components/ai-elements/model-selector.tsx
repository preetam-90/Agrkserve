'use client';

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ModelSelectorCtx = {
  open: boolean;
  setOpen: (open: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
};

const ModelSelectorContext = createContext<ModelSelectorCtx | null>(null);

export function ModelSelector({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const value = useMemo(
    () => ({ open, setOpen: onOpenChange, query, setQuery }),
    [open, onOpenChange, query]
  );

  return <ModelSelectorContext.Provider value={value}>{children}</ModelSelectorContext.Provider>;
}

export function ModelSelectorTrigger({
  children,
  asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const ctx = useContext(ModelSelectorContext);
  if (!ctx) return <>{children}</>;

  if (asChild && isValidElement(children)) {
    const childProps = (children.props || {}) as { onClick?: () => void };
    const handleClick = () => {
      childProps.onClick?.();
      ctx.setOpen(!ctx.open);
    };

    return cloneElement(children, { onClick: handleClick } as { onClick: () => void });
  }

  return (
    <button
      className="inline-flex items-center"
      onClick={() => ctx.setOpen(!ctx.open)}
      type="button"
    >
      {children}
    </button>
  );
}

export function ModelSelectorContent({ children }: { children: ReactNode }) {
  const ctx = useContext(ModelSelectorContext);
  if (!ctx?.open) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/15 bg-[#0a1110]/95 p-2 shadow-2xl backdrop-blur-xl">
      {children}
    </div>
  );
}

export function ModelSelectorInput({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(ModelSelectorContext);
  if (!ctx) return null;

  return (
    <input
      className="mb-2 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      onChange={(event) => ctx.setQuery(event.target.value)}
      placeholder={placeholder}
      value={ctx.query}
    />
  );
}

export function ModelSelectorList({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-72 space-y-2 overflow-y-auto pr-1" data-allow-native-scroll="true">
      {children}
    </div>
  );
}

export function ModelSelectorEmpty({ children }: { children: ReactNode }) {
  return <div className="px-2 py-2 text-sm text-white/55">{children}</div>;
}

export function ModelSelectorGroup({ children, heading }: { children: ReactNode; heading: string }) {
  return (
    <section>
      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
        {heading}
      </p>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

export function ModelSelectorItem({
  children,
  onSelect,
  value,
}: {
  children: ReactNode;
  onSelect: () => void;
  value: string;
}) {
  const ctx = useContext(ModelSelectorContext);
  if (ctx?.query && !value.toLowerCase().includes(ctx.query.toLowerCase())) {
    return null;
  }

  return (
    <button
      className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-transparent px-2.5 py-2 text-left text-sm text-white/90 transition hover:border-emerald-300/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      onClick={onSelect}
      type="button"
    >
      {children}
    </button>
  );
}

export function ModelSelectorLogo({ provider }: { provider: string }) {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-400/10 text-[10px] font-semibold uppercase text-emerald-100">
      {provider.slice(0, 1)}
    </span>
  );
}

export function ModelSelectorLogoGroup({ children }: { children: ReactNode }) {
  return <span className="ml-auto inline-flex items-center gap-1">{children}</span>;
}

export function ModelSelectorName({ children }: { children: ReactNode }) {
  return <span className="truncate text-sm text-white/95">{children}</span>;
}
