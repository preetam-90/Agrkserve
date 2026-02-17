'use client';

import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { UIMessage } from 'ai';

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '@/components/ai-elements/attachments';
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
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { SpeechInput } from '@/components/ai-elements/speech-input';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { CheckIcon, GlobeIcon, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

interface ModelOption {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  providers: string[];
}

interface ModelApiResponse {
  models: Array<{ id: string; name: string; provider: string }>;
}

const fallbackModels: ModelOption[] = [
  {
    chef: 'Groq',
    chefSlug: 'groq',
    id: 'groq/llama-3.3-70b-versatile',
    name: 'llama-3.3-70b-versatile',
    providers: ['groq'],
  },
  {
    chef: 'Groq',
    chefSlug: 'groq',
    id: 'groq/llama-3.1-8b-instant',
    name: 'llama-3.1-8b-instant',
    providers: ['groq'],
  },
  {
    chef: 'Groq',
    chefSlug: 'groq',
    id: 'groq/mixtral-8x7b-32768',
    name: 'mixtral-8x7b-32768',
    providers: ['groq'],
  },
  {
    chef: 'Groq',
    chefSlug: 'groq',
    id: 'groq/gemma2-9b-it',
    name: 'gemma2-9b-it',
    providers: ['groq'],
  },
];

const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  attachment: { id: string; name: string; type: string; url: string };
  onRemove: (id: string) => void;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(attachment.id);
  }, [attachment.id, onRemove]);

  return (
    <Attachment data={attachment} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
};

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => {
      attachments.remove(id);
    },
    [attachments]
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem attachment={attachment} key={attachment.id} onRemove={handleRemove} />
      ))}
    </Attachments>
  );
};

const ModelItem = ({
  m,
  isSelected,
  onSelect,
}: {
  m: ModelOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const handleSelect = useCallback(() => {
    onSelect(m.id);
  }, [m.id, onSelect]);

  return (
    <ModelSelectorItem onSelect={handleSelect} value={`${m.id} ${m.name}`}>
      <ModelSelectorLogo provider={m.chefSlug} />
      <ModelSelectorName>{m.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {m.providers.map((provider) => (
          <ModelSelectorLogo key={provider} provider={provider} />
        ))}
      </ModelSelectorLogoGroup>
      {isSelected ? <CheckIcon className="ml-auto size-4" /> : <div className="ml-auto size-4" />}
    </ModelSelectorItem>
  );
};

const providerLabel = (provider: string) => {
  const normalized = provider.toLowerCase();
  if (normalized === 'groq') return 'Groq';
  if (normalized === 'openrouter') return 'OpenRouter';
  if (normalized === 'arcee-ai') return 'Arcee AI';
  if (normalized === 'openai') return 'OpenAI';
  if (normalized === 'anthropic') return 'Anthropic';
  if (normalized === 'google') return 'Google';
  if (normalized === 'meta-llama') return 'Meta';
  if (normalized === 'mistralai') return 'Mistral';
  if (normalized === 'x-ai') return 'xAI';
  return provider.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const convertModels = (rows: ModelApiResponse['models']): ModelOption[] => {
  const converted = rows.map((model) => {
    const provider = model.provider || model.id.split('/')[0] || 'other';
    return {
      id: model.id,
      name: model.name || model.id,
      chef: providerLabel(provider),
      chefSlug: provider.toLowerCase(),
      providers: [provider.toLowerCase()],
    };
  });

  return converted.length > 0 ? converted : fallbackModels;
};

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
  message.parts.filter((part) => part.type === 'source-url');

const isRenderableMessage = (
  message: UIMessage
): message is UIMessage & { role: 'user' | 'assistant' } =>
  message.role === 'user' || message.role === 'assistant';

const Example = () => {
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState<string>('');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [models, setModels] = useState<ModelOption[]>(fallbackModels);
  const [model, setModel] = useState<string>(fallbackModels[0].id);

  useEffect(() => {
    let active = true;

    const loadModels = async () => {
      try {
        const response = await fetch('/api/chat/models', { cache: 'no-store' });
        if (!response.ok) return;

        const payload = (await response.json()) as ModelApiResponse;
        if (!active || !payload?.models) return;

        const nextModels = convertModels(payload.models);
        setModels(nextModels);
        setModel((prev) => (nextModels.some((m) => m.id === prev) ? prev : nextModels[0].id));
      } catch {
        // fall back silently
      }
    };

    void loadModels();
    return () => {
      active = false;
    };
  }, []);

  const { messages, sendMessage, status, error } = useChat<UIMessage>({
    transport: useMemo(
      () =>
        new DefaultChatTransport({
          api: '/api/chat',
          prepareSendMessagesRequest: ({ id, messages: requestMessages, body }) => ({
            body: {
              ...(body ?? {}),
              id,
              messages: requestMessages,
              model,
              webSearch: useWebSearch,
            },
          }),
        }),
      [model, useWebSearch]
    ),
  });

  const selectedModelData = useMemo(() => models.find((m) => m.id === model), [model, models]);
  const chefs = useMemo(() => Array.from(new Set(models.map((m) => m.chef))), [models]);

  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      if (message.files?.length) {
        toast.success(`${message.files.length} file(s) attached to message`);
      }

      const prompt = message.text?.trim() || 'Sent with attachments';
      try {
        await sendMessage({ text: prompt });
        setText('');
      } catch (err) {
        const messageText = err instanceof Error ? err.message : 'Failed to send message';
        toast.error(messageText);
      }
    },
    [sendMessage]
  );

  const handleTranscriptionChange = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleTextChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  }, []);

  const toggleWebSearch = useCallback(() => {
    setUseWebSearch((prev) => !prev);
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    setModel(modelId);
    setModelSelectorOpen(false);
  }, []);

  const isSubmitDisabled = status === 'streaming' || status === 'submitted';
  const isThinking = status === 'submitted' || status === 'streaming';
  const visibleMessages = messages.filter(isRenderableMessage);

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(20,83,45,0.2),transparent_48%),linear-gradient(180deg,#030a07_0%,#050907_100%)]">
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
          </div>
          <div className="flex items-center gap-2">
            <PromptInputButton
              className={useWebSearch ? 'border-emerald-300/35 bg-emerald-400/15' : ''}
              onClick={toggleWebSearch}
              variant="ghost"
            >
              <GlobeIcon className="size-4" />
              <span>{useWebSearch ? 'Web Search On' : 'Web Search Off'}</span>
            </PromptInputButton>
            <div className="relative">
              <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
                <ModelSelectorTrigger asChild>
                  <PromptInputButton variant="ghost">
                    {selectedModelData?.chefSlug && (
                      <ModelSelectorLogo provider={selectedModelData.chefSlug} />
                    )}
                    <ModelSelectorName>{selectedModelData?.name || 'Select model'}</ModelSelectorName>
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {chefs.map((chef) => (
                      <ModelSelectorGroup heading={chef} key={chef}>
                        {models
                          .filter((m) => m.chef === chef)
                          .map((m) => (
                            <ModelItem
                              isSelected={model === m.id}
                              key={m.id}
                              m={m}
                              onSelect={handleModelSelect}
                            />
                          ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </div>
          </div>
        </div>
      </div>

      <Conversation>
        <ConversationContent forceAutoScroll={isThinking}>
          {visibleMessages.length === 0 && (
            <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 text-center shadow-xl backdrop-blur md:p-10">
              <p className="text-base text-emerald-100">Start a conversation with AgriServe AI</p>
              <p className="mt-2 text-sm text-white/60">
                Ask about crops, weather planning, equipment usage, or platform support.
              </p>
            </div>
          )}

          {visibleMessages.map((message) => {
            const textContent = getMessageText(message);
            const reasoningInfo = getMessageReasoningInfo(message);
            const sources = getMessageSources(message);

            return (
              <MessageBranch defaultBranch={0} key={message.id}>
                <MessageBranchContent>
                  <Message from={message.role} key={message.id}>
                    <div>
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

      <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#07100d]/90 pb-4 pt-3 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6">
          {error && (
            <div className="mb-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error.message}
            </div>
          )}

          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea onChange={handleTextChange} value={text} />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <SpeechInput
                  className="shrink-0"
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                />
              </PromptInputTools>
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
