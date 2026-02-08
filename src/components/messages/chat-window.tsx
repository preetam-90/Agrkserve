'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import {
  ArrowLeft,
  MoreVertical,
  Smile,
  Image as ImageIcon,
  Send,
  X,
  Reply,
  Loader2,
  Trash2,
  Paperclip,
  Check,
  CheckCheck,
  Maximize2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMessagesStore, useAuthStore } from '@/lib/store';
import { Avatar, Button, Spinner, EmptyState } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  compressImage,
  compressVideo,
  formatFileSize,
  formatDuration,
  type CompressionProgress,
  MAX_VIDEO_DURATION_SECONDS,
} from '@/lib/utils/media-compression';
import { VideoTrimmer } from './video-trimmer';
import { MediaViewer } from './media-viewer';
import { UnifiedMediaPicker } from './unified-media-picker';
import { MessageReactions, QuickReactionPicker } from './message-reactions';
import { MessageActions } from './message-actions';
import { LinkPreview, extractUrls } from './link-preview';
import { ReplyPreview, LocationShare } from './message-reply';
import type { DirectMessage, KlipyMedia } from '@/lib/types';
import { klipyService } from '@/lib/services/klipy-service';

// Helper to get video metadata
function getVideoMetadata(
  file: File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };

    video.src = url;
  });
}

interface ChatWindowProps {
  conversationId: string;
  onBack?: () => void;
  showBackButton?: boolean;
  className?: string;
}

export function ChatWindow({
  conversationId,
  onBack,
  showBackButton = false,
  className,
}: ChatWindowProps) {
  const { user } = useAuthStore();
  const {
    activeConversation,
    messages,
    messagesLoading,
    hasMoreMessages,
    setActiveConversation,
    fetchMessages,
    sendMessage,
    sendMediaMessage,
    sendKlipyMediaMessage,
    deleteMessage,
    deletedMessageIds,
  } = useMessagesStore();

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showVideoTrimmer, setShowVideoTrimmer] = useState(false);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [viewingMediaId, setViewingMediaId] = useState<string | null>(null);
  const [, setShowMediaDrawer] = useState(false);
  const [selectedKlipyMedia, setSelectedKlipyMedia] = useState<KlipyMedia | null>(null);
  const [showUnifiedPicker, setShowUnifiedPicker] = useState(false);

  // New features state
  const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set active conversation
  useEffect(() => {
    if (conversationId) {
      setActiveConversation(conversationId);
    }

    return () => {
      // Don't clear active conversation on unmount to preserve state during navigation
    };
  }, [conversationId, setActiveConversation]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversationId]);

  // Handle emoji selection from unified picker
  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  // Handle reply to message
  const handleReply = (message: DirectMessage) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  // Handle reaction to message
  const handleReact = async (messageId: string, emoji: string) => {
    // TODO: Implement reaction API call
    console.log('React to message:', messageId, emoji);
  };

  // Handle copy message
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could show a toast notification here
  };

  // Handle delete message
  const handleDelete = async (messageId: string, mode: 'me' | 'everyone') => {
    try {
      console.log('=== handleDelete called ===');
      console.log('Message ID:', messageId);
      console.log('Mode:', mode);
      await deleteMessage(messageId, mode);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert(
        `Failed to delete message: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Load more messages on scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || messagesLoading || !hasMoreMessages) return;

    // Load more when scrolled near the top
    if (container.scrollTop < 100) {
      fetchMessages(conversationId, true);
    }
  }, [conversationId, fetchMessages, hasMoreMessages, messagesLoading]);

  const handleMediaSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Please select an image or video file');
      return;
    }

    setMediaType(isImage ? 'image' : 'video');

    if (isVideo) {
      try {
        const metadata = await getVideoMetadata(file);

        if (metadata.duration > MAX_VIDEO_DURATION_SECONDS) {
          setPendingVideoFile(file);
          setShowVideoTrimmer(true);
          return;
        }

        setIsCompressing(true);
        const processedFile = await compressVideo(file, setCompressionProgress);
        setSelectedMedia(processedFile);
        setMediaPreview(URL.createObjectURL(processedFile));
      } catch (error) {
        console.error('Failed to process video:', error);
        alert(error instanceof Error ? error.message : 'Failed to process video');
        clearMedia();
      } finally {
        setIsCompressing(false);
        setCompressionProgress(null);
      }
    } else {
      setIsCompressing(true);
      try {
        const processedFile = await compressImage(file, setCompressionProgress);
        setSelectedMedia(processedFile);
        setMediaPreview(URL.createObjectURL(processedFile));
      } catch (error) {
        console.error('Failed to process image:', error);
        alert(error instanceof Error ? error.message : 'Failed to process image');
        clearMedia();
      } finally {
        setIsCompressing(false);
        setCompressionProgress(null);
      }
    }
  };

  const handleVideoTrimComplete = async (trimmedFile: File) => {
    setShowVideoTrimmer(false);
    setPendingVideoFile(null);

    setIsCompressing(true);
    try {
      const processedFile = await compressVideo(trimmedFile, setCompressionProgress);
      setSelectedMedia(processedFile);
      setMediaPreview(URL.createObjectURL(processedFile));
    } catch (error) {
      console.error('Failed to process trimmed video:', error);
      alert(error instanceof Error ? error.message : 'Failed to process video');
      clearMedia();
    } finally {
      setIsCompressing(false);
      setCompressionProgress(null);
    }
  };

  const handleVideoTrimCancel = () => {
    setShowVideoTrimmer(false);
    setPendingVideoFile(null);
    clearMedia();
  };

  const clearMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setSelectedMedia(null);
    setMediaPreview(null);
    setMediaType(null);
    setSelectedKlipyMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKlipyMediaSelect = (media: KlipyMedia) => {
    setSelectedKlipyMedia(media);
    // Set preview URL from KLIPY
    setMediaPreview(klipyService.getOptimalSize(media, 'preview'));
    setMediaType('image');
    setShowMediaDrawer(false);
  };

  const handleSend = async () => {
    if (isSending || isCompressing) return;

    const trimmedContent = inputValue.trim();
    if (!trimmedContent && !selectedMedia && !selectedKlipyMedia) return;

    setIsSending(true);

    try {
      const replyToMessageId = replyingTo?.id;

      if (selectedKlipyMedia) {
        // Send KLIPY media (GIF, Meme, Sticker, Clip)
        await sendKlipyMediaMessage(
          {
            slug: selectedKlipyMedia.slug,
            type: selectedKlipyMedia.type,
            media_url: klipyService.getOptimalSize(selectedKlipyMedia, 'full'),
            blur_preview: selectedKlipyMedia.blur_preview,
            width: selectedKlipyMedia.width,
            height: selectedKlipyMedia.height,
            duration_seconds: selectedKlipyMedia.duration_seconds,
            size_bytes: selectedKlipyMedia.size_bytes,
            thumbnail_url: selectedKlipyMedia.thumbnail_url,
          },
          trimmedContent || undefined,
          replyToMessageId
        );
        clearMedia();
      } else if (selectedMedia && mediaType) {
        // Send regular media (image/video uploaded by user)
        await sendMediaMessage(
          selectedMedia,
          mediaType,
          trimmedContent || undefined,
          replyToMessageId
        );
        clearMedia();
      } else {
        // Send text message
        await sendMessage(trimmedContent, replyToMessageId);
      }
      setInputValue('');
      setReplyingTo(null); // Clear reply state after sending
    } catch (error) {
      console.error('Failed to send message:', error);
      if (!selectedMedia && !selectedKlipyMedia) {
        setInputValue(trimmedContent);
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation && messagesLoading) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!activeConversation) {
    return (
      <div className={cn('flex h-full items-center justify-center bg-[#0a0a0a]', className)}>
        <EmptyState
          icon={<div className="text-6xl">💬</div>}
          title="Select a conversation"
          description="Choose a conversation from the list to start messaging"
        />
      </div>
    );
  }

  return (
    <>
      {showVideoTrimmer && pendingVideoFile && (
        <VideoTrimmer
          file={pendingVideoFile}
          maxDuration={MAX_VIDEO_DURATION_SECONDS}
          onComplete={handleVideoTrimComplete}
          onCancel={handleVideoTrimCancel}
        />
      )}

      {viewingMediaId && (
        <MediaViewer
          messages={messages}
          currentMessageId={viewingMediaId}
          onClose={() => setViewingMediaId(null)}
          onNavigate={(messageId) => setViewingMediaId(messageId)}
        />
      )}

      {/* Unified Media & Emoji Picker */}
      <UnifiedMediaPicker
        isOpen={showUnifiedPicker}
        onClose={() => setShowUnifiedPicker(false)}
        onSelectEmoji={handleEmojiSelect}
        onSelectKlipy={handleKlipyMediaSelect}
      />

      <div
        className={cn(
          'relative flex h-full min-h-0 flex-col overflow-hidden bg-[#0a0a0a]',
          className
        )}
      >
        {/* Header - overlayed at top (absolute) so only messages scroll */}
        <div className="absolute left-0 right-0 top-0 z-30 flex h-14 flex-shrink-0 items-center gap-2 border-b border-[#262626] bg-[#0f0f0f]/95 px-3 py-2.5 backdrop-blur-xl sm:h-16 sm:gap-3 sm:px-4 sm:py-3 md:px-6 lg:px-8">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}

          <Link
            href={`/user/${activeConversation.other_user_id}`}
            className="flex min-w-0 flex-1 items-center gap-2 transition-opacity hover:opacity-80 sm:gap-3"
          >
            <div className="relative">
              <Avatar
                src={activeConversation.other_user_avatar}
                name={activeConversation.other_user_name}
                size="md"
                className="ring-2 ring-[#262626]"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0f0f0f] bg-[#22c55e]"></span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-white sm:text-base">
                {activeConversation.other_user_name || 'Unknown User'}
              </h2>
              <p className="truncate text-[10px] text-gray-400 sm:text-xs">
                {activeConversation.last_message || 'No messages yet'}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-white/10 hover:text-white"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 pb-28 pt-14 sm:px-4 sm:py-6 sm:pb-32 sm:pt-16 md:px-6 lg:px-8"
          onScroll={handleScroll}
          data-lenis-prevent
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Load more indicator */}
          {messagesLoading && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <Spinner size="sm" />
            </div>
          )}

          {/* Messages */}
          {messages.length === 0 && !messagesLoading ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 text-6xl">👋</div>
              <p className="text-lg font-medium text-white">Start the conversation</p>
              <p className="mt-2 text-sm text-gray-400">
                Say hello to {activeConversation.other_user_name}
              </p>
            </div>
          ) : (
            <MessageList
              messages={messages}
              currentUserId={user?.id || ''}
              deletedMessageIds={deletedMessageIds}
              onMediaClick={(messageId) => setViewingMediaId(messageId)}
              onReply={handleReply}
              onReact={handleReact}
              onCopy={handleCopy}
              onDelete={handleDelete}
              hoveredMessageId={hoveredMessageId}
              onHover={setHoveredMessageId}
            />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Media Preview - Fixed at bottom above input */}
        {(selectedMedia || selectedKlipyMedia) && mediaPreview && (
          <div className="flex-shrink-0 border-t border-[#262626] bg-[#0f0f0f] p-3 sm:p-4">
            <div className="relative flex items-center gap-2 sm:gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#333333] sm:h-20 sm:w-20">
                {(mediaType === 'image' || selectedKlipyMedia?.type === 'gif') && (
                  <Image
                    src={mediaPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                )}
                {selectedKlipyMedia?.type === 'sticker' && (
                  <video src={mediaPreview} className="h-full w-full object-cover"></video>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white sm:text-sm">
                  {selectedKlipyMedia ? selectedKlipyMedia.title : selectedMedia?.name}
                </p>
                <p className="text-[10px] text-gray-400 sm:text-xs">
                  {selectedKlipyMedia
                    ? selectedKlipyMedia.type.toUpperCase()
                    : selectedMedia && formatFileSize(selectedMedia.size)}
                </p>
                {compressionProgress && (
                  <p className="mt-0.5 text-[10px] text-blue-400 sm:mt-1 sm:text-xs">
                    {compressionProgress.message}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMedia}
                disabled={isCompressing}
                className="h-8 w-8 flex-shrink-0 p-0 text-gray-400 hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Input - Fixed at bottom */}
        <div className="pb-safe flex-shrink-0 border-t border-[#262626] bg-[#0f0f0f]/95 p-3 backdrop-blur-xl sm:p-4 md:px-6 lg:px-8">
          {/* Reply Preview */}
          {replyingTo && (
            <ReplyPreview
              message={{
                id: replyingTo.id,
                content: replyingTo.content,
                sender: replyingTo.sender,
                message_type: replyingTo.message_type,
              }}
              onCancel={() => setReplyingTo(null)}
            />
          )}

          <div className="flex items-end gap-2 sm:gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />

            {/* Message Input Container - Dark themed boxed with slight rounded corners */}
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#333333] bg-[#1a1a1a] px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
              {/* Paperclip - Attachment */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isCompressing || !!selectedMedia || !!selectedKlipyMedia}
                className="h-8 w-8 flex-shrink-0 rounded-lg p-0 text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="flex-1 bg-transparent px-2 text-sm text-white placeholder:text-gray-500 focus:outline-none sm:text-base"
                disabled={isSending || isCompressing}
              />

              {/* Right side icons */}
              <div className="flex items-center gap-0.5 sm:gap-1">
                {/* Unified Media & Emoji Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUnifiedPicker(true)}
                  disabled={isSending || isCompressing}
                  className="h-8 w-8 flex-shrink-0 rounded-lg p-0 text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"
                  title="Add emoji, GIF, or sticker"
                >
                  <Smile className="h-5 w-5" />
                </Button>

                {/* Camera/Image Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending || isCompressing || !!selectedMedia || !!selectedKlipyMedia}
                  className="h-8 w-8 flex-shrink-0 rounded-lg p-0 text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"
                  title="Send image or video"
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={
                (!inputValue.trim() && !selectedMedia && !selectedKlipyMedia) ||
                isSending ||
                isCompressing
              }
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-0 shadow-lg shadow-blue-500/25 transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-blue-500/30 disabled:opacity-50 sm:h-11 sm:w-11"
            >
              {isSending || isCompressing ? (
                <Loader2 className="h-4 w-4 animate-spin text-white sm:h-5 sm:w-5" />
              ) : (
                <Send className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
          <div className="mt-1.5 text-center sm:mt-2">
            <span className="text-[9px] text-gray-600 sm:text-[10px]">
              Press Enter to send • Videos over 30s will be trimmed • ✨ for GIFs & Memes
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

interface MessageListProps {
  messages: DirectMessage[];
  currentUserId: string;
  deletedMessageIds: Set<string>;
  onMediaClick?: (messageId: string) => void;
  onReply?: (message: DirectMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onCopy?: (text: string) => void;
  onDelete?: (messageId: string, mode: 'me' | 'everyone') => void;
  hoveredMessageId: string | null;
  onHover: (messageId: string | null) => void;
}

function MessageList({
  messages,
  currentUserId,
  deletedMessageIds,
  onMediaClick,
  onReply,
  onReact,
  onCopy,
  onDelete,
  hoveredMessageId,
  onHover,
}: MessageListProps) {
  // Group messages by date
  const groupedMessages: { date: Date; messages: DirectMessage[] }[] = [];

  messages.forEach((message) => {
    const messageDate = new Date(message.created_at);
    const lastGroup = groupedMessages[groupedMessages.length - 1];

    if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({ date: messageDate, messages: [message] });
    }
  });

  return (
    <>
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date separator */}
          <DateSeparator date={group.date} />

          {/* Messages for this date */}
          {group.messages.map((message, messageIndex) => {
            const isDeleted = deletedMessageIds.has(message.id);
            const isOwn = message.sender_id === currentUserId;
            const prevMessage = group.messages[messageIndex - 1];
            const nextMessage = group.messages[messageIndex + 1];

            // Check if this message is part of a consecutive group
            const isGrouped = prevMessage && prevMessage.sender_id === message.sender_id;
            const nextIsGrouped = nextMessage && nextMessage.sender_id === message.sender_id;

            // Show avatar for first message in group or if sender changes
            const showAvatar = !isGrouped && !isOwn;

            // Group styling
            const isFirstInGroup = !isGrouped;
            const isLastInGroup = !nextIsGrouped;

            return (
              <div key={message.id}>
                {isDeleted ? (
                  <DeletedMessageBubble
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    senderName={message.sender?.name || undefined}
                  />
                ) : (
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                    onMediaClick={onMediaClick}
                    onReply={onReply}
                    onReact={onReact}
                    onCopy={onCopy}
                    onDelete={onDelete}
                    currentUserId={currentUserId}
                    isHovered={hoveredMessageId === message.id}
                    onHover={onHover}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}

interface DateSeparatorProps {
  date: Date;
}

function DateSeparator({ date }: DateSeparatorProps) {
  let label: string;

  if (isToday(date)) {
    label = 'Today';
  } else if (isYesterday(date)) {
    label = 'Yesterday';
  } else {
    label = format(date, 'MMMM d, yyyy');
  }

  return (
    <div className="my-6 flex items-center justify-center">
      <div className="rounded-full bg-[#1a1a1a] px-3 py-1 text-xs text-gray-400">{label}</div>
    </div>
  );
}

interface DeletedMessageBubbleProps {
  isOwn: boolean;
  showAvatar: boolean;
  senderName?: string;
}

function DeletedMessageBubble({ isOwn, showAvatar, senderName }: DeletedMessageBubbleProps) {
  return (
    <div className={cn('mb-2 flex items-end gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar name={senderName || 'Unknown'} size="sm" />
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
      )}

      {/* Deleted message bubble */}
      <div
        className={cn(
          'max-w-[70%] overflow-hidden rounded-2xl border border-dashed border-gray-700/50 bg-[#1a1a1a]/80 px-4 py-2.5 backdrop-blur-sm',
          isOwn ? 'rounded-br-md' : 'rounded-bl-md'
        )}
      >
        <div className="flex items-center gap-2 text-gray-400">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800">
            <Trash2 className="h-3 w-3" />
          </div>
          <span className="text-xs italic text-gray-500 sm:text-sm">This message was deleted</span>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: DirectMessage;
  isOwn: boolean;
  showAvatar: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onMediaClick?: (messageId: string) => void;
  onReply?: (message: DirectMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onCopy?: (text: string) => void;
  onDelete?: (messageId: string, mode: 'me' | 'everyone') => void;
  currentUserId?: string;
  isHovered?: boolean;
  onHover?: (messageId: string | null) => void;
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isFirstInGroup: _isFirstInGroup,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLastInGroup: _isLastInGroup,
  onMediaClick,
  onReply,
  onReact,
  onCopy,
  onDelete,
  currentUserId,
  isHovered,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onHover: _onHover,
}: MessageBubbleProps) {
  const time = format(new Date(message.created_at), 'h:mm a');
  const deliveryStatus = message.delivery_status || (message.is_read ? 'read' : 'delivered');
  const hasMedia = message.message_type !== 'text' && message.media_url;
  const hasReactions = message.reactions && message.reactions.length > 0;
  const isDeleted = message.is_deleted;

  const handleMediaClick = () => {
    if (hasMedia && onMediaClick) {
      onMediaClick(message.id);
    }
  };

  return (
    <div
      className={cn('mb-2 flex items-end gap-2 sm:gap-3', isOwn ? 'justify-end' : 'justify-start')}
    >
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar src={message.sender?.profile_image} name={message.sender?.name} size="sm" />
          ) : (
            <div className="h-8 w-8" />
          )}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'group flex max-w-[85%] flex-col sm:max-w-[75%]',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'overflow-hidden rounded-2xl',
            isOwn ? 'bg-blue-500 text-white' : 'bg-[#1a1a1a] text-white',
            hasMedia ? 'p-0' : 'px-3 py-2 sm:px-4 sm:py-2'
          )}
        >
          {/* Reply Thread - Shows original message being replied to (like WhatsApp/Telegram style) */}
          {message.reply_to_message && (
            <div
              className={cn(
                'group/reply via-blue-500/8 cursor-pointer overflow-hidden rounded-t-lg border-l-4 border-blue-400 bg-gradient-to-r from-blue-500/15 to-transparent p-2.5 transition-all hover:border-blue-300 hover:from-blue-500/20 hover:via-blue-500/10',
                hasMedia ? 'm-2 mb-0 rounded-lg' : ''
              )}
            >
              <div className="flex items-start gap-2">
                {/* Reply icon indicator */}
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/25">
                  <Reply className="h-3 w-3 text-blue-300" />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Sender name with badge */}
                  <div className="mb-1 flex items-center gap-1.5">
                    <div className="h-1 w-1 animate-pulse rounded-full bg-blue-300" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-300">
                      {message.reply_to_message.sender?.name || 'Unknown'}
                    </p>
                  </div>

                  {/* Message preview */}
                  <div className="flex items-center gap-2">
                    {message.reply_to_message.media_url && (
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded border border-blue-400/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={message.reply_to_message.media_url}
                          alt="Media preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-gray-200">
                      {message.reply_to_message.message_type === 'image' &&
                        !message.reply_to_message.content &&
                        '📷 Photo'}
                      {message.reply_to_message.message_type === 'video' &&
                        !message.reply_to_message.content &&
                        '🎥 Video'}
                      {message.reply_to_message.message_type === 'gif' &&
                        !message.reply_to_message.content &&
                        '🎬 GIF'}
                      {message.reply_to_message.message_type === 'sticker' &&
                        !message.reply_to_message.content &&
                        '🎭 Sticker'}
                      {message.reply_to_message.content ||
                        (message.reply_to_message.media_url ? '📎 Media' : 'Message')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Media content */}
          {hasMedia && (
            <div className="relative">
              {/* KLIPY GIF */}
              {message.message_type === 'gif' && message.media_url && (
                <div
                  className="relative cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
                  onClick={handleMediaClick}
                >
                  {message.klipy_blur_preview && (
                    <div className="absolute inset-0">
                      <Image
                        src={`data:image/jpeg;base64,${message.klipy_blur_preview}`}
                        alt="Loading..."
                        fill
                        className="scale-110 blur-md"
                        unoptimized
                      />
                    </div>
                  )}
                  <Image
                    src={message.media_url}
                    alt="GIF"
                    width={message.media_width || 300}
                    height={message.media_height || 200}
                    className="max-h-[250px] w-auto object-contain sm:max-h-[300px]"
                    unoptimized
                  />
                </div>
              )}

              {/* KLIPY Meme */}
              {message.message_type === 'image' && message.media_url && (
                <div
                  className="relative cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
                  onClick={handleMediaClick}
                >
                  {message.klipy_blur_preview && (
                    <div className="absolute inset-0">
                      <Image
                        src={`data:image/jpeg;base64,${message.klipy_blur_preview}`}
                        alt="Loading..."
                        fill
                        className="scale-110 blur-md"
                        unoptimized
                      />
                    </div>
                  )}
                  <Image
                    src={message.media_url}
                    alt="Meme"
                    width={message.media_width || 300}
                    height={message.media_height || 200}
                    className="max-h-[250px] w-auto object-contain sm:max-h-[300px]"
                    unoptimized
                  />
                </div>
              )}

              {/* KLIPY Sticker - with transparent background */}
              {message.message_type === 'sticker' && message.media_url && (
                <div className="relative bg-transparent p-2 sm:p-2">
                  {message.klipy_blur_preview && (
                    <div className="absolute inset-0">
                      <Image
                        src={`data:image/jpeg;base64,${message.klipy_blur_preview}`}
                        alt="Loading..."
                        fill
                        className="scale-110 blur-md"
                        unoptimized
                      />
                    </div>
                  )}
                  <Image
                    src={message.media_url}
                    alt="Sticker"
                    width={message.media_width || 200}
                    height={message.media_height || 200}
                    className="max-h-[150px] w-auto object-contain sm:max-h-[200px]"
                    unoptimized
                  />
                </div>
              )}

              {/* Regular Image */}
              {message.message_type === 'image' && message.media_url && (
                <div
                  className="relative cursor-pointer overflow-hidden transition-opacity hover:opacity-90"
                  onClick={handleMediaClick}
                >
                  <Image
                    src={message.media_url}
                    alt="Shared image"
                    width={message.media_width || 300}
                    height={message.media_height || 200}
                    className="max-h-[250px] w-auto object-contain sm:max-h-[300px]"
                    unoptimized
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-black/50 p-1.5 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
                  </div>
                </div>
              )}

              {/* Regular Video */}
              {message.message_type === 'video' && message.media_url && (
                <div className="relative">
                  <video
                    src={message.media_url}
                    className="max-h-[250px] w-auto rounded-t-2xl sm:max-h-[300px]"
                    controls
                    preload="metadata"
                  />
                  {message.media_duration_seconds && (
                    <div className="absolute bottom-4 right-4 rounded bg-black/70 px-2 py-1 text-[10px] text-white sm:text-xs">
                      {formatDuration(message.media_duration_seconds)}
                    </div>
                  )}
                </div>
              )}

              {/* Caption below media */}
              {message.content && (
                <div className="px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm">
                  {message.content}
                </div>
              )}
            </div>
          )}

          {/* Deleted message indicator */}
          {isDeleted ? (
            <span className="text-xs italic text-gray-500 sm:text-sm">
              This message was deleted
            </span>
          ) : (
            <>
              {/* Text-only content */}
              {!hasMedia && message.content && (
                <span className="text-xs sm:text-sm">{message.content}</span>
              )}

              {/* Link preview */}
              {!hasMedia && message.content && (
                <LinkPreview
                  url={extractUrls(message.content)[0] || ''}
                  preview={message.link_preview}
                />
              )}

              {/* Location share */}
              {message.message_type === 'location' &&
                message.location_lat &&
                message.location_lng && (
                  <LocationShare
                    lat={message.location_lat}
                    lng={message.location_lng}
                    address={message.location_address}
                  />
                )}
            </>
          )}
        </div>

        {/* Reactions */}
        {!isDeleted && hasReactions && (
          <MessageReactions
            messageId={message.id}
            reactions={message.reactions || null}
            currentUserId={currentUserId || ''}
            onReact={onReact || (() => {})}
          />
        )}

        {/* Time, read status, and actions */}
        <div className="mt-0.5 flex items-center gap-2 sm:mt-1">
          <div className="flex items-center gap-1 text-[10px] text-gray-500 sm:text-xs">
            <span>{time}</span>
            {isOwn && (
              <span className="flex items-center">
                {deliveryStatus === 'read' ? (
                  <CheckCheck className="h-3 w-3 text-blue-400" />
                ) : deliveryStatus === 'delivered' ? (
                  <CheckCheck className="h-3 w-3" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>

          {/* Quick reactions on hover */}
          {!isDeleted && isHovered && onReact && (
            <QuickReactionPicker
              messageId={message.id}
              onReact={onReact}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            />
          )}

          {/* Message actions menu */}
          {!isDeleted && onCopy && onReply && onDelete && (
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <MessageActions
                message={message}
                isOwn={isOwn}
                onCopy={onCopy}
                onReply={onReply}
                onDelete={onDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
