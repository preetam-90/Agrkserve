import { create } from 'zustand';
import type { AIChatMessage } from '@/lib/types';

interface AIChatState {
  // Messages
  messages: AIChatMessage[];
  messagesLoading: boolean;
  hasMoreMessages: boolean;

  // Chat session
  conversationId: string | null;
  isTyping: boolean;

  // Local tracking
  error: string | null;
}

interface AIChatActions {
  // Messages
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  setTyping: (typing: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState: AIChatState = {
  messages: [],
  messagesLoading: false,
  hasMoreMessages: false,
  conversationId: null,
  isTyping: false,
  error: null,
};

export const useAIChatStore = create<AIChatState & AIChatActions>((set, get) => ({
  ...initialState,

  sendMessage: async (content: string) => {
    const { messages, conversationId } = get();

    if (!content.trim()) return;

    set({ messagesLoading: true, error: null });

    try {
      // Add user message optimistically
      const userMessage: AIChatMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        role: 'user',
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      set({ messages: [...messages, userMessage] });

      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();

      // Replace temporary user message with actual one from server
      // Replace temporary user message with actual one from server
      const actualUserMessage: AIChatMessage = {
        id: data.user_message.id,
        conversation_id: data.conversation_id || conversationId,
        role: 'user',
        content: content.trim(),
        created_at: data.user_message.created_at,
      };

      // Add assistant response
      const assistantMessage: AIChatMessage = {
        id: data.assistant_message.id,
        conversation_id: data.conversation_id || conversationId,
        role: 'assistant',
        content: data.assistant_message.content,
        created_at: data.assistant_message.created_at,
        model: data.assistant_message.model,
      };

      set({
        messages: [...messages, actualUserMessage, assistantMessage],
        conversationId: data.conversation_id,
        messagesLoading: false,
        isTyping: false,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      set({
        messagesLoading: false,
        isTyping: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      });
      throw error;
    }
  },

  clearChat: () => {
    set(initialState);
  },

  setTyping: (typing: boolean) => {
    set({ isTyping: typing });
  },

  reset: () => {
    get().clearChat();
  },
}));
