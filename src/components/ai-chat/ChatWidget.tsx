'use client';

/**
 * ChatWidget — Floating chat widget (FAB + popup) for AgriServe.
 *
 * Features added:
 *   - Media upload (images, videos, documents) via paperclip button
 *   - Automatic model switching when media is attached
 *   - Media preview in user message bubbles
 *   - Cleanup: deletes media on new chat, maximize-to-fullpage, and page leave
 */

import { useChatWidgetStore } from '@/lib/store/ai-chat-store';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageResponse } from '@/components/ai-elements/message';
import { ChatMediaChip, ChatMediaPreviewList } from '@/components/ai-elements/attachments';
import { Maximize2, X, Send, Sparkles, RotateCcw, Bot, Paperclip, Eye } from 'lucide-react';
import { useChatMedia, type ChatMediaItem } from '@/hooks/use-chat-media';

export function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    chatId,
    isOpen,
    hasUnread,
    closeWidget,
    markRead,
    setHasUnread,
    setHasWidgetConversation,
    resetChat,
    toggleWidget,
  } = useChatWidgetStore();

  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Media upload state from the useChatMedia hook.
   */
  const {
    uploads,
    isUploading,
    selectFiles,
    removeAndDeleteUpload,
    clearUploads,
    deleteAllFromCloudinary,
  } = useChatMedia();

  /**
   * Ref tracking current uploads for the beforeunload event handler.
   */
  const uploadsRef = useRef<ChatMediaItem[]>([]);
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  /**
   * Per-user-message media history for display in sent bubbles.
   */
  const [userMessageMedia, setUserMessageMedia] = useState<ChatMediaItem[][]>([]);

  // ─── Chat transport ───────────────────────────────────────────────────────

  const { messages, sendMessage, status } = useChat<UIMessage>({
    id: chatId,
    transport: useMemo(
      () =>
        new DefaultChatTransport({
          api: '/api/chat',
          prepareSendMessagesRequest: ({ id, messages: reqMsgs, body }) => ({
            body: {
              ...(body ?? {}),
              id,
              messages: reqMsgs,
            },
          }),
        }),
      []
    ),
  });

  // ─── Auto-scroll ──────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Conversation tracking ────────────────────────────────────────────────

  useEffect(() => {
    if (messages.length > 0) setHasWidgetConversation(true);
  }, [messages.length, setHasWidgetConversation]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant') setHasUnread(true);
    }
  }, [messages, isOpen, setHasUnread]);

  useEffect(() => {
    if (isOpen) {
      markRead();
      const timer = setTimeout(() => textareaRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, markRead]);

  // ─── beforeunload cleanup ─────────────────────────────────────────────────

  /**
   * When the user closes/refreshes the page, delete all uploaded media
   * using navigator.sendBeacon for guaranteed delivery during unload.
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      const toDelete = uploadsRef.current.filter((u) => u.status === 'uploaded' && u.publicId);
      if (toDelete.length === 0) return;

      navigator.sendBeacon(
        '/api/chat/media/delete',
        new Blob(
          [
            JSON.stringify({
              mediaItems: toDelete.map((u) => ({ publicId: u.publicId, type: u.type })),
            }),
          ],
          { type: 'application/json' }
        )
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!text.trim() || status === 'streaming' || status === 'submitted') return;
      if (isUploading) return; // Wait for uploads to finish

      const payloads = uploads
        .filter((u) => u.status === 'uploaded')
        .map((u) => ({
          url: u.url,
          publicId: u.publicId,
          type: u.type,
          name: u.name,
          mimeType: u.mimeType,
          extractedText: u.extractedText,
        }));
      const currentUploads = uploads.filter((u) => u.status === 'uploaded');

      if (currentUploads.length > 0) {
        setUserMessageMedia((prev) => [...prev, currentUploads]);
      }

      try {
        await sendMessage(
          { text: text.trim() },
          {
            body: {
              mediaAttachments: payloads,
              webSearch: false,
              model: 'groq/llama-3.1-8b-instant',
            },
          }
        );
        setText('');
        clearUploads();
      } catch {
        // error handled by useChat
      }
    },
    [text, status, isUploading, uploads, sendMessage, clearUploads]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  /**
   * Handles file selection via the paperclip button.
   */
  const handleFilesSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      await selectFiles(e.target.files);
      e.target.value = ''; // Reset so same file can be re-selected
    },
    [selectFiles]
  );

  /**
   * Maximise: clean up uploads before navigating to the full-page chat.
   * The full-page chat starts with its own fresh useChatMedia instance.
   */
  const handleMaximize = useCallback(async () => {
    await deleteAllFromCloudinary();
    clearUploads();
    setUserMessageMedia([]);
    closeWidget();
    router.push('/ai-chat');
  }, [deleteAllFromCloudinary, clearUploads, closeWidget, router]);

  /**
   * New chat: delete all current session uploads then reset the chat ID.
   */
  const handleNewChat = useCallback(async () => {
    await deleteAllFromCloudinary();
    clearUploads();
    setUserMessageMedia([]);
    resetChat();
  }, [deleteAllFromCloudinary, clearUploads, resetChat]);

  // ─── Derived state ────────────────────────────────────────────────────────

  // Don't render on AI chat page or landing page
  if (pathname === '/ai-chat' || pathname === '/') return null;

  const visibleMessages = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
  const isThinking = status === 'submitted' || status === 'streaming';
  const hasReadyMedia = uploads.some((u) => u.status === 'uploaded');
  const isSubmitDisabled =
    !text.trim() || status === 'streaming' || status === 'submitted' || isUploading;

  const getMessageText = (message: UIMessage) =>
    message.parts
      .filter(
        (part): part is Extract<(typeof message.parts)[number], { type: 'text' }> =>
          part.type === 'text'
      )
      .map((part) => part.text)
      .join('');

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── FAB Button ── */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
          aria-label="Open AI Chat"
        >
          <Bot className="size-6" />
          {hasUnread && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold ring-2 ring-[#07100d]">
              !
            </span>
          )}
        </button>
      )}

      {/* ── Chat Popup ── */}
      {isOpen && (
        <div className="animate-widget-slide-up fixed bottom-5 right-5 z-50 flex h-[calc(100vh-100px)] w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#07100d] shadow-2xl shadow-black/50 sm:h-[580px] sm:w-[420px] md:h-[600px] md:w-[440px]">
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-900/50 to-[#07100d] px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-100">AgriServe AI</span>
              {isThinking && (
                <span className="animate-pulse rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] text-emerald-200">
                  Thinking...
                </span>
              )}
              {/* Vision model badge */}
              {hasReadyMedia && !isThinking && (
                <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-400/10 px-1.5 py-0.5 text-[10px] text-violet-300">
                  <Eye className="size-2.5" />
                  Vision
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewChat}
                className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                title="New conversation"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                onClick={handleMaximize}
                className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                title="Open full chat"
              >
                <Maximize2 className="size-3.5" />
              </button>
              <button
                onClick={closeWidget}
                className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                title="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-3 py-3">
            {visibleMessages.length === 0 && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 text-center">
                <Bot className="mx-auto mb-2 size-8 text-emerald-400/60" />
                <p className="text-sm text-emerald-100">How can I help you today?</p>
                <p className="mt-1 text-xs text-white/40">
                  Ask about equipment, bookings, or farming advice. You can also attach images or
                  documents.
                </p>
              </div>
            )}

            {visibleMessages.map((message, absoluteIndex) => {
              const textContent = getMessageText(message);

              const userMsgIndex =
                message.role === 'user'
                  ? visibleMessages.slice(0, absoluteIndex + 1).filter((m) => m.role === 'user')
                      .length - 1
                  : -1;
              const messageMedia = userMsgIndex >= 0 ? (userMessageMedia[userMsgIndex] ?? []) : [];

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      message.role === 'user'
                        ? 'bg-emerald-600/80 text-white'
                        : 'border border-white/5 bg-white/[0.08] text-white/90'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <MessageResponse>{textContent || '...'}</MessageResponse>
                    ) : (
                      <>
                        {/* Media preview in user bubble */}
                        {messageMedia.length > 0 && (
                          <div className="mb-1.5">
                            <ChatMediaPreviewList items={messageMedia} />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{textContent}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {isThinking && visibleMessages[visibleMessages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/5 bg-white/[0.08] px-4 py-3">
                  <div className="flex gap-1">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/60"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/60"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/60"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ── */}
          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-white/10 bg-[#07100d]/95 px-3 pb-3 pt-2"
          >
            {/* ── Upload chips ── */}
            {uploads.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {uploads.map((item) => (
                  <ChatMediaChip
                    key={item.id}
                    item={item}
                    onRemove={() => removeAndDeleteUpload(item.id)}
                  />
                ))}
              </div>
            )}

            {/* Uploading hint */}
            {isUploading && (
              <p className="mb-1.5 text-[11px] text-amber-300/70">
                ⏳ Uploading files, please wait…
              </p>
            )}

            {/* Input row */}
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 transition focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20">
              {/* Paperclip / attach button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mb-0.5 shrink-0 rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white/70"
                title="Attach image, video, or document"
              >
                <Paperclip className="size-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFilesSelected}
              />

              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={uploads.length > 0 ? 'Describe your media...' : 'Type a message...'}
                rows={1}
                className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent text-sm text-white/90 placeholder:text-white/30 focus:outline-none"
                style={{ height: 'auto', overflow: 'hidden' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 96)}px`;
                }}
              />

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
