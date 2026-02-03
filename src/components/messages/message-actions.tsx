'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Reply, Trash2, MoreVertical, Check, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { DirectMessage } from '@/lib/types';

interface MessageActionsProps {
  message: DirectMessage;
  isOwn: boolean;
  onCopy: (text: string) => void;
  onReply: (message: DirectMessage) => void;
  onDelete: (messageId: string, mode: 'me' | 'everyone') => void;
}

export function MessageActions({ message, isOwn, onCopy, onReply, onDelete }: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCopy = () => {
    if (message.content) {
      onCopy(message.content);
    }
    setIsOpen(false);
  };

  const handleReply = () => {
    onReply(message);
    setIsOpen(false);
  };

  const handleDelete = (mode: 'me' | 'everyone') => {
    onDelete(message.id, mode);
    setIsOpen(false);
    setShowDeleteConfirm(false);
  };

  if (message.is_deleted) return null;

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-6 w-6 rounded-full p-0 text-gray-500 opacity-0 transition-opacity hover:bg-[#2a2a2a] hover:text-gray-300 group-hover:opacity-100"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-full right-0 z-50 mb-1 w-48 rounded-xl border border-[#333333] bg-[#1a1a1a] py-1 shadow-xl">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={handleCopy}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a]"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>

              <button
                onClick={handleReply}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a]"
              >
                <Reply className="h-4 w-4" />
                Reply
              </button>

              <div className="my-1 border-t border-[#333333]" />

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          ) : (
            <div className="px-3 py-2">
              <p className="mb-2 text-xs text-gray-500">Delete message?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete('me')}
                  className="flex-1 rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-[#333333]"
                >
                  For me
                </button>
                {isOwn && (
                  <button
                    onClick={() => handleDelete('everyone')}
                    className="flex-1 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/30"
                  >
                    For all
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-400"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
