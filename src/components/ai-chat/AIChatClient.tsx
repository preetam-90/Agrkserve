'use client';

/**
 * AIChatClient — Full-page AI chat interface for AgriServe.
 *
 * Features added:
 *   - Media upload (images, videos, documents) via Cloudinary
 *   - Automatic model switching: llama-4-scout for media, llama-3.1-8b for text
 *   - Media preview in user message bubbles
 *   - Auto-delete media on new chat or page leave (navigator.sendBeacon)
 *   - Web search toggle
 *   - Vision model badge indicator
 */

import type { UIMessage } from 'ai';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFileButton,
  PromptInputFooter,
  PromptInputMediaPreview,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { ChatMediaPreviewList } from '@/components/ai-elements/attachments';
import { useChatWidgetStore } from '@/lib/store/ai-chat-store';
import { useChatMedia, type ChatMediaItem } from '@/hooks/use-chat-media';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { GlobeIcon, RotateCcw, Sparkles, Eye } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getMessageText = (message: UIMessage) =>
  message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('');

const getMessageReasoningInfo = (message: UIMessage) => {
  const reasoningParts = message.parts.filter((part) => part.type === 'reasoning');
  const text = reasoningParts
    .map((part) => (part.type === 'reasoning' ? part.text : ''))
    .join('\n');
  const isStreaming = reasoningParts.some(
    (part) => part.type === 'reasoning' && part.state === 'streaming'
  );
  return { text, isStreaming };
};

const getMessageSources = (message: UIMessage) =>
  message.parts.filter(
    (part): part is Extract<(typeof message.parts)[number], { type: 'source-url' }> =>
      part.type === 'source-url'
  );

const isRenderableMessage = (
  message: UIMessage
): message is UIMessage & { role: 'user' | 'assistant' } =>
  message.role === 'user' || message.role === 'assistant';

// ─── Component ────────────────────────────────────────────────────────────────

const Example = () => {
  const { chatId, resetChat } = useChatWidgetStore();
  const [text, setText] = useState<string>('');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  /**
   * Media upload state from the useChatMedia hook.
   * Manages uploads, validation, progress, and Cloudinary deletion.
   */
  const {
    uploads,
    isUploading,
    selectFiles,
    removeAndDeleteUpload,
    clearUploads,
    deleteAllFromCloudinary,
    getPayloads,
  } = useChatMedia();

  /**
   * Tracks current uploads via a ref for the beforeunload event handler.
   * Refs do not cause re-renders and are always up-to-date in event handlers.
   */
  const uploadsRef = useRef<ChatMediaItem[]>([]);
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  /**
   * Per-user-message media history for displaying media in sent bubbles.
   * Index i corresponds to the i-th user message in the conversation.
   * Reset when a new chat session starts.
   */
  const [userMessageMedia, setUserMessageMedia] = useState<ChatMediaItem[][]>([]);

  // ─── Chat transport ───────────────────────────────────────────────────────

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    id: chatId,
    transport: useMemo(
      () =>
        new DefaultChatTransport({
          api: '/api/chat',
          prepareSendMessagesRequest: ({ id, messages: requestMessages, body }) => ({
            body: {
              ...(body ?? {}),
              id,
              messages: requestMessages,
            },
          }),
        }),
      []
    ),
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  /**
   * Handles form submission from the PromptInput component.
   * Validates text, attaches pending media payloads, sends the message,
   * and clears the input/uploads on success.
   */
  const handleSubmit = useCallback(
    async (message: { text?: string }) => {
      const trimmed = message.text?.trim();
      if (!trimmed || status === 'streaming' || status === 'submitted') return;

      // Block send while files are still uploading
      if (isUploading) return;

      const payloads = getPayloads();
      const currentUploads = uploads.filter((u) => u.status === 'uploaded');

      // Store media association for this user message (for display in bubble)
      if (currentUploads.length > 0) {
        setUserMessageMedia((prev) => [...prev, currentUploads]);
      }

      try {
        await sendMessage(
          { text: trimmed },
          {
            body: {
              mediaAttachments: payloads,
              webSearch: useWebSearch,
              model: 'groq/llama-3.1-8b-instant',
            },
          }
        );
        setText('');
        clearUploads(); // Clear local state (Cloudinary files stay until new chat/page leave)
      } catch {
        // error handled by useChat
      }
    },
    [sendMessage, status, isUploading, getPayloads, uploads, clearUploads, useWebSearch]
  );

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  }, []);

  const toggleWebSearch = useCallback(() => {
    setUseWebSearch((prev) => !prev);
  }, []);

  /**
   * Handles file selection from the PromptInputFileButton.
   * Passes files to useChatMedia for validation, upload, and tracking.
   * Shows inline error messages for any rejected files.
   */
  const handleFilesSelected = useCallback(
    async (files: FileList) => {
      const errors = await selectFiles(files);
      // Errors are shown inline via ChatMediaChip status — no separate toast needed
      if (errors.length > 0) {
        console.warn('[AIChatClient] File validation errors:', errors);
      }
    },
    [selectFiles]
  );

  /**
   * Starts a new chat session.
   * Deletes all uploaded media from Cloudinary before resetting.
   */
  const handleNewChat = useCallback(async () => {
    await deleteAllFromCloudinary();
    clearUploads();
    setUserMessageMedia([]);
    resetChat();
  }, [deleteAllFromCloudinary, clearUploads, resetChat]);

  // ─── beforeunload cleanup ─────────────────────────────────────────────────

  /**
   * Registers a beforeunload handler that sends a beacon to delete all
   * uploaded media from Cloudinary when the user leaves/closes the page.
   *
   * Uses navigator.sendBeacon instead of fetch because:
   * - Beacon requests are guaranteed to complete even during page unload
   * - fetch() is cancelled when the page unloads
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      const toDelete = uploadsRef.current.filter((u) => u.status === 'uploaded' && u.publicId);
      if (toDelete.length === 0) return;

      const payload = new Blob(
        [
          JSON.stringify({
            mediaItems: toDelete.map((u) => ({ publicId: u.publicId, type: u.type })),
          }),
        ],
        { type: 'application/json' }
      );

      navigator.sendBeacon('/api/chat/media/delete', payload);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // Empty deps — reads from ref, not state

  // ─── Derived state ────────────────────────────────────────────────────────

  const isSubmitDisabled = status === 'streaming' || status === 'submitted' || isUploading;
  const isThinking = status === 'submitted' || status === 'streaming';
  const visibleMessages = messages.filter(isRenderableMessage);

  /** True when any uploaded file is ready to send (triggers vision model badge) */
  const hasReadyMedia = uploads.some((u) => u.status === 'uploaded');

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(20,83,45,0.2),transparent_48%),linear-gradient(180deg,#030a07_0%,#050907_100%)]">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-[#07100d]/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="inline-flex items-center gap-2 text-sm text-emerald-100">
            <Sparkles className="size-4 text-emerald-300" />
            <span className="font-medium">AI Assistant</span>
            {isThinking && (
              <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-200">
                Thinking...
              </span>
            )}
            {/* Vision model badge — shown when media is attached */}
            {hasReadyMedia && !isThinking && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-400/10 px-2 py-0.5 text-[11px] text-violet-200">
                <Eye className="size-3" />
                Vision
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PromptInputButton
              onClick={handleNewChat}
              variant="ghost"
              title="Start new conversation"
            >
              <RotateCcw className="size-4" />
              <span>New Chat</span>
            </PromptInputButton>
            <PromptInputButton
              className={useWebSearch ? 'border-emerald-300/35 bg-emerald-400/15' : ''}
              onClick={toggleWebSearch}
              variant="ghost"
            >
              <GlobeIcon className="size-4" />
              <span>{useWebSearch ? 'Web Search On' : 'Web Search Off'}</span>
            </PromptInputButton>
          </div>
        </div>
      </div>

      {/* ── Message history ── */}
      <Conversation>
        <ConversationContent forceAutoScroll={isThinking}>
          {visibleMessages.length === 0 && (
            <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 text-center shadow-xl backdrop-blur md:p-10">
              <p className="text-base text-emerald-100">Start a conversation with AgriServe AI</p>
              <p className="mt-2 text-sm text-white/60">
                Ask about crops, weather planning, equipment usage, or platform support. You can
                also attach images, videos, or documents.
              </p>
            </div>
          )}

          {visibleMessages.map((message, absoluteIndex) => {
            const textContent = getMessageText(message);
            const reasoningInfo = getMessageReasoningInfo(message);
            const sources = getMessageSources(message);

            /**
             * Retrieve the media attached to this user message.
             * We count user messages up to and including the current index
             * to get the correct entry in userMessageMedia[].
             */
            const userMsgIndex =
              message.role === 'user'
                ? visibleMessages.slice(0, absoluteIndex + 1).filter((m) => m.role === 'user')
                    .length - 1
                : -1;
            const messageMedia = userMsgIndex >= 0 ? (userMessageMedia[userMsgIndex] ?? []) : [];

            return (
              <MessageBranch defaultBranch={0} key={message.id}>
                <MessageBranchContent>
                  <Message from={message.role} key={message.id}>
                    <div>
                      {/* ── Media preview in user bubble ── */}
                      {message.role === 'user' && messageMedia.length > 0 && (
                        <ChatMediaPreviewList items={messageMedia} />
                      )}

                      {sources.length > 0 && (
                        <Sources>
                          <SourcesTrigger count={sources.length} />
                          <SourcesContent>
                            {sources.map((source) => (
                              <Source
                                href={source.url}
                                key={source.sourceId}
                                title={source.title || source.url}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}

                      {reasoningInfo.text && (
                        <Reasoning duration={0}>
                          <ReasoningTrigger />
                          <ReasoningContent>{reasoningInfo.text}</ReasoningContent>
                        </Reasoning>
                      )}

                      <MessageContent>
                        <MessageResponse>{textContent || '...'}</MessageResponse>
                      </MessageContent>

                      {reasoningInfo.isStreaming && (
                        <p className="mt-2 text-[11px] text-white/50">Reasoning is streaming...</p>
                      )}
                    </div>
                  </Message>
                </MessageBranchContent>
              </MessageBranch>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* ── Input area ── */}
      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#07100d]/90 pb-4 pt-3 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          {error && (
            <div className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error.message}
            </div>
          )}

          {/* Uploading-blocked hint */}
          {isUploading && (
            <div className="mb-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200">
              ⏳ Waiting for files to finish uploading before sending…
            </div>
          )}

          <PromptInput onSubmit={handleSubmit}>
            {/* ── Media attachment chips — shown above textarea ── */}
            <PromptInputMediaPreview uploads={uploads} onRemove={removeAndDeleteUpload} />

            <PromptInputBody>
              <PromptInputTextarea
                onChange={handleTextChange}
                value={text}
                placeholder={
                  uploads.length > 0 ? 'Add a message about your media...' : 'Ask anything...'
                }
              />
            </PromptInputBody>

            <PromptInputFooter>
              <div className="flex items-center gap-1.5">
                {/* File attachment button */}
                <PromptInputFileButton
                  onFilesSelected={handleFilesSelected}
                  disabled={isSubmitDisabled}
                />

                {/* Vision model indicator */}
                {hasReadyMedia && (
                  <span className="inline-flex items-center gap-1 rounded-lg border border-violet-400/20 bg-violet-400/10 px-2 py-1 text-[11px] text-violet-300">
                    <Eye className="size-3" />
                    llama-4-scout active
                  </span>
                )}
              </div>

              <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default Example;
export { Example as AIChatClient };
