/**
 * Attachment display components for AI chat media uploads.
 *
 * Components:
 *   - Attachments          — wrapper container
 *   - Attachment           — single item container (provides context)
 *   - AttachmentPreview    — icon + filename (original generic version)
 *   - AttachmentRemove     — remove button (original generic version)
 *   - ChatMediaChip        — compact chip for chat input area showing upload status
 *   - ChatMediaPreview     — rich preview in the sent message bubble
 */
'use client';

import { FileText, Film, X, AlertCircle, Loader2, ImageIcon, CheckCircle2 } from 'lucide-react';
import { createContext, useContext, type ReactNode } from 'react';
import type { ChatMediaItem } from '@/hooks/use-chat-media';

// ─── Original generic attachment components (kept for backward compatibility) ─

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
  return (
    <div className={variant === 'inline' ? 'flex flex-wrap gap-2' : 'grid gap-2'}>{children}</div>
  );
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

// ─── New chat-media-specific components ───────────────────────────────────────

/**
 * Returns the appropriate icon for a media type.
 */
function MediaTypeIcon({ type, className }: { type: ChatMediaItem['type']; className?: string }) {
  if (type === 'image') return <ImageIcon className={className ?? 'size-3.5'} />;
  if (type === 'video') return <Film className={className ?? 'size-3.5'} />;
  return <FileText className={className ?? 'size-3.5'} />;
}

/**
 * ChatMediaChip — compact chip displayed in the chat input area.
 *
 * Shows:
 *   - Image: small thumbnail preview
 *   - Video/Document: type icon + truncated filename
 *   - Uploading: spinning loader + progress
 *   - Error: red warning icon + error tooltip
 *   - Uploaded: checkmark badge on image, normal display for others
 *
 * @param item      - ChatMediaItem from useChatMedia hook
 * @param onRemove  - Called when user clicks the × button
 */
export function ChatMediaChip({ item, onRemove }: { item: ChatMediaItem; onRemove: () => void }) {
  const isUploading = item.status === 'uploading';
  const isError = item.status === 'error';
  const progress = item.progress ?? 0;

  return (
    <div
      className={`group relative inline-flex max-w-[200px] items-center gap-1.5 overflow-hidden rounded-xl border px-2 py-1.5 text-xs transition-all ${
        isError
          ? 'border-red-400/30 bg-red-500/10 text-red-200'
          : isUploading
            ? 'border-white/10 bg-white/[0.06] text-white/60'
            : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-50'
      }`}
      title={isError ? item.errorMessage : item.name}
    >
      {isUploading && (
        <>
          <div
            className="absolute inset-0 bg-emerald-500/15 transition-all duration-300 ease-out"
            style={{ transform: `translateX(${progress - 100}%)` }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400/50 transition-all duration-300 ease-out"
            style={{ transform: `scaleX(${progress / 100})`, transformOrigin: 'left' }}
          />
        </>
      )}

      <div className="relative z-10 flex items-center gap-1.5">
        {item.type === 'image' && item.previewUrl ? (
          <div className="relative size-6 shrink-0 overflow-hidden rounded-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
            {item.status === 'uploaded' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <CheckCircle2 className="size-3 text-emerald-400" />
              </div>
            )}
          </div>
        ) : isError ? (
          <AlertCircle className="size-3.5 shrink-0 text-red-400" />
        ) : isUploading ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-emerald-400" />
        ) : (
          <MediaTypeIcon type={item.type} className="size-3.5 shrink-0 text-emerald-300" />
        )}

        <span className="max-w-[110px] truncate leading-none">
          {isError ? 'Upload failed' : item.name}
        </span>

        {isUploading && (
          <span className="shrink-0 text-[10px] tabular-nums text-emerald-300/80">{progress}%</span>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 shrink-0 rounded-full p-0.5 opacity-60 transition hover:bg-white/15 hover:text-white hover:opacity-100"
          aria-label={`Remove ${item.name}`}
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}

/**
 * ChatMediaPreview — rich media preview rendered inside a chat message bubble.
 *
 * For user messages that included media attachments, renders:
 *   - Images: full-width thumbnail (max 240px) with rounded corners
 *   - Videos: dark card with video icon, filename, and URL link
 *   - Documents: dark card with document icon and filename
 */
export function ChatMediaPreview({
  item,
}: {
  item: Pick<ChatMediaItem, 'type' | 'url' | 'name' | 'previewUrl' | 'mimeType'>;
}) {
  if (item.type === 'image') {
    return (
      <div className="mb-1.5 overflow-hidden rounded-xl border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url || item.previewUrl}
          alt={item.name}
          className="max-h-48 w-full max-w-[240px] object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
      >
        <Film className="size-4 shrink-0 text-emerald-400" />
        <span className="truncate">{item.name}</span>
      </a>
    );
  }

  // Document
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/80 transition hover:bg-white/10"
    >
      <FileText className="size-4 shrink-0 text-emerald-400" />
      <span className="truncate">{item.name}</span>
    </a>
  );
}

/**
 * ChatMediaPreviewList — renders a row of ChatMediaPreview items.
 * Used in user message bubbles to display all attached media.
 */
export function ChatMediaPreviewList({
  items,
}: {
  items: Array<Pick<ChatMediaItem, 'type' | 'url' | 'name' | 'previewUrl' | 'mimeType'>>;
}) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <ChatMediaPreview key={`${item.url}-${i}`} item={item} />
      ))}
    </div>
  );
}
