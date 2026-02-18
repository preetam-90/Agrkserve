'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Generate a stable chat ID
function generateChatId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface ChatWidgetState {
  chatId: string;
  isOpen: boolean;
  hasUnread: boolean;
  hasWidgetConversation: boolean;
}

interface ChatWidgetActions {
  openWidget: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  markRead: () => void;
  setHasUnread: (value: boolean) => void;
  setHasWidgetConversation: (value: boolean) => void;
  resetChat: () => void;
  generateNewChatId: () => string;
}

const initialState: ChatWidgetState = {
  chatId: generateChatId(),
  isOpen: false,
  hasUnread: false,
  hasWidgetConversation: false,
};

export const useChatWidgetStore = create<ChatWidgetState & ChatWidgetActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      openWidget: () => set({ isOpen: true, hasUnread: false }),
      closeWidget: () => set({ isOpen: false }),
      toggleWidget: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen, hasUnread: isOpen ? get().hasUnread : false });
      },
      markRead: () => set({ hasUnread: false }),
      setHasUnread: (value: boolean) => set({ hasUnread: value }),
      setHasWidgetConversation: (value: boolean) => set({ hasWidgetConversation: value }),
      resetChat: () =>
        set({
          chatId: generateChatId(),
          hasWidgetConversation: false,
          hasUnread: false,
        }),
      generateNewChatId: () => {
        const newId = generateChatId();
        set({ chatId: newId, hasWidgetConversation: false, hasUnread: false });
        return newId;
      },
    }),
    {
      name: 'agri-serve-chat-widget',
      partialize: (state) => ({
        chatId: state.chatId,
        hasWidgetConversation: state.hasWidgetConversation,
      }),
    }
  )
);

// Re-export for backward compatibility (legacy store name)
export const useAIChatStore = useChatWidgetStore;
