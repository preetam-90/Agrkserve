'use client';

import { FileText, X } from 'lucide-react';
import { createContext, useContext, type ReactNode } from 'react';

type AttachmentData = { id: string; name: string; type: string; url: string };

const AttachmentContext = createContext<{
  data: AttachmentData;
  onRemove?: () => void;
} | null>(null);

export function Attachments({
  children,
  variant,
}: {
  children: ReactNode;
  variant?: 'inline' | 'stack';
}) {
  return <div className={variant === 'inline' ? 'flex flex-wrap gap-2' : 'grid gap-2'}>{children}</div>;
}

export function Attachment({
  children,
  data,
  onRemove,
}: {
  children: ReactNode;
  data: AttachmentData;
  onRemove?: () => void;
}) {
  return (
    <AttachmentContext.Provider value={{ data, onRemove }}>
      <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1.5 text-xs text-emerald-50">
        {children}
      </div>
    </AttachmentContext.Provider>
  );
}

export function AttachmentPreview() {
  const ctx = useContext(AttachmentContext);
  if (!ctx) return null;

  return (
    <>
      <FileText className="size-3.5 text-emerald-200" />
      <span className="max-w-[190px] truncate">{ctx.data.name}</span>
    </>
  );
}

export function AttachmentRemove() {
  const ctx = useContext(AttachmentContext);
  if (!ctx?.onRemove) return null;

  return (
    <button
      aria-label="Remove attachment"
      className="rounded-md p-0.5 text-emerald-100/70 transition hover:bg-white/15 hover:text-white"
      onClick={ctx.onRemove}
      type="button"
    >
      <X className="size-3.5" />
    </button>
  );
}
