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
        <div className="absolute bottom-full right-0 z-50 mb-2 min-w-[200px] max-w-[280px] overflow-hidden rounded-2xl border border-[#333333] bg-[#1a1a1a] shadow-2xl ring-1 ring-black/50">
          {!showDeleteConfirm ? (
            <div className="py-1">
              <button
                onClick={handleCopy}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                  <Copy className="h-4 w-4 text-blue-400" />
                </div>
                <span className="font-medium">Copy</span>
              </button>

              <button
                onClick={handleReply}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#2a2a2a]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10">
                  <Reply className="h-4 w-4 text-green-400" />
                </div>
                <span className="font-medium">Reply</span>
              </button>

              <div className="my-1 border-t border-[#333333]" />

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </div>
                <span className="font-medium">Delete</span>
              </button>
            </div>
          ) : (
            <div className="w-full min-w-[200px] p-4">
              <p className="mb-4 text-center text-sm font-medium text-gray-300">Delete message?</p>
              <div className="flex w-full flex-col gap-2">
                <button
                  onClick={() => handleDelete('me')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2a2a2a] px-4 py-2.5 text-sm font-medium text-gray-200 transition-all hover:bg-[#333333] hover:text-white"
                >
                  <span className="text-base">🙈</span>
                  <span>Delete for me</span>
                </button>
                {isOwn && (
                  <button
                    onClick={() => handleDelete('everyone')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-300 transition-all hover:bg-red-500/30"
                  >
                    <span className="text-base">🗑️</span>
                    <span>Delete for everyone</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-sm text-gray-400 transition-colors hover:text-gray-200"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
