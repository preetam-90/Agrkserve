'use client';

import { cn } from '@/lib/utils';

interface MessageReactionsProps {
  messageId: string;
  reactions: { emoji: string; count: number; users: string[] }[] | null;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
}

const AVAILABLE_REACTIONS = ['👍', '❤️', '🔥', '😂', '😮'];

export function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onReact,
}: MessageReactionsProps) {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.includes(currentUserId);
        return (
          <button
            key={reaction.emoji}
            onClick={() => onReact(messageId, reaction.emoji)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all',
              hasReacted
                ? 'border border-blue-500/50 bg-blue-500/30 text-blue-300'
                : 'border border-[#333333] bg-[#2a2a2a] text-gray-400 hover:bg-[#333333]'
            )}
            title={reaction.users.length > 1 ? `${reaction.count} reactions` : '1 reaction'}
          >
            <span>{reaction.emoji}</span>
            {reaction.count > 1 && <span className="text-xs">{reaction.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Quick reaction picker for adding new reactions
interface QuickReactionPickerProps {
  messageId: string;
  onReact: (messageId: string, emoji: string) => void;
  className?: string;
}

export function QuickReactionPicker({ messageId, onReact, className }: QuickReactionPickerProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {AVAILABLE_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(messageId, emoji)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a2a2a] text-sm transition-all hover:scale-110 hover:bg-[#333333]"
          title={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
