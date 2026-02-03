import { create } from 'zustand';
import { dmService } from '@/lib/services';
import type { DirectMessage, DMConversation } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './auth-store';

interface MessagesState {
  // Conversations list (inbox)
  conversations: DMConversation[];
  conversationsLoading: boolean;

  // Active conversation
  activeConversation: DMConversation | null;
  activeConversationId: string | null;

  // Messages for active conversation
  messages: DirectMessage[];
  messagesLoading: boolean;
  hasMoreMessages: boolean;

  // Local tracking
  deletedMessageIds: Set<string>;

  // Unread count
  unreadCount: number;

  // Realtime subscription channels
  conversationsChannel: ReturnType<ReturnType<typeof createClient>['channel']> | null;
  messagesChannel: ReturnType<ReturnType<typeof createClient>['channel']> | null;
  readStatusChannel: ReturnType<ReturnType<typeof createClient>['channel']> | null;
}

interface MessagesActions {
  // Conversations
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversationId: string | null) => Promise<void>;
  startConversation: (otherUserId: string) => Promise<string>;

  // Messages
  fetchMessages: (conversationId: string, loadMore?: boolean) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendMediaMessage: (file: File, mediaType: 'image' | 'video', caption?: string) => Promise<void>;
  sendKlipyMediaMessage: (
    klipyMedia: {
      slug: string;
      type: 'gif' | 'sticker';
      media_url: string;
      blur_preview?: string;
      width?: number;
      height?: number;
      duration_seconds?: number;
      size_bytes?: number;
      thumbnail_url?: string;
    },
    caption?: string
  ) => Promise<void>;
  markAsRead: () => Promise<void>;
  markAsDelivered: (messageIds: string[]) => Promise<void>;
  addMessage: (message: DirectMessage) => void;
  updateMessageDeliveryStatus: (messageId: string, status: 'delivered' | 'read') => void;
  deleteMessage: (messageId: string, mode: 'me' | 'everyone') => Promise<void>;

  // Unread count
  fetchUnreadCount: () => Promise<void>;

  // Realtime
  subscribeToConversations: (userId: string) => void;
  subscribeToActiveConversation: () => void;
  unsubscribeAll: () => void;

  // Reset
  reset: () => void;
}

const initialState: MessagesState = {
  // Conversations
  conversations: [],
  activeConversationId: null,
  activeConversation: null,
  conversationsLoading: false,

  // Messages
  messages: [],
  messagesLoading: false,
  hasMoreMessages: false,

  // Local tracking
  deletedMessageIds: new Set<string>(),

  // Unread count
  unreadCount: 0,

  // Realtime channels
  conversationsChannel: null,
  messagesChannel: null,
  readStatusChannel: null,
};

export const useMessagesStore = create<MessagesState & MessagesActions>((set, get) => ({
  ...initialState,

  fetchConversations: async () => {
    set({ conversationsLoading: true });
    try {
      const conversations = await dmService.getConversations();
      set({ conversations, conversationsLoading: false });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      set({ conversationsLoading: false });
    }
  },

  setActiveConversation: async (conversationId: string | null) => {
    const { messagesChannel, readStatusChannel, unsubscribeAll } = get();

    // Cleanup previous subscriptions
    if (messagesChannel) {
      dmService.unsubscribe(messagesChannel);
    }
    if (readStatusChannel) {
      dmService.unsubscribe(readStatusChannel);
    }

    if (!conversationId) {
      set({
        activeConversation: null,
        activeConversationId: null,
        messages: [],
        hasMoreMessages: true,
        messagesChannel: null,
        readStatusChannel: null,
      });
      return;
    }

    set({ activeConversationId: conversationId, messagesLoading: true });

    try {
      // Fetch conversation details
      const conversation = await dmService.getConversation(conversationId);
      set({ activeConversation: conversation });

      // Fetch initial messages
      await get().fetchMessages(conversationId);

      // Mark messages as read
      await get().markAsRead();

      // Subscribe to new messages and read status
      get().subscribeToActiveConversation();
    } catch (error) {
      console.error('Failed to set active conversation:', error);
      set({ messagesLoading: false });
    }
  },

  startConversation: async (otherUserId: string) => {
    try {
      const conversationId = await dmService.getOrCreateConversation(otherUserId);

      // Refresh conversations list
      await get().fetchConversations();

      return conversationId;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  },

  fetchMessages: async (conversationId: string, loadMore = false) => {
    const { messages } = get();

    set({ messagesLoading: true });

    try {
      const beforeId = loadMore && messages.length > 0 ? messages[0].id : undefined;
      const newMessages = await dmService.getMessages(conversationId, 50, beforeId);

      if (loadMore) {
        // Prepend older messages
        set({
          messages: [...newMessages, ...messages],
          hasMoreMessages: newMessages.length === 50,
          messagesLoading: false,
        });
      } else {
        // Replace messages
        set({
          messages: newMessages,
          hasMoreMessages: newMessages.length === 50,
          messagesLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ messagesLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    const { activeConversationId } = get();

    if (!activeConversationId || !content.trim()) return;

    try {
      const message = await dmService.sendMessage(activeConversationId, content);

      // Optimistically add the message if not already present
      const { messages } = get();
      if (!messages.find((m) => m.id === message.id)) {
        set({ messages: [...messages, message] });
      }

      // Refresh conversations to update last message
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  sendMediaMessage: async (file: File, mediaType: 'image' | 'video', caption?: string) => {
    const { activeConversationId } = get();

    if (!activeConversationId) return;

    try {
      const message = await dmService.sendMediaMessage(
        activeConversationId,
        file,
        mediaType,
        caption
      );

      // Optimistically add the message if not already present
      const { messages } = get();
      if (!messages.find((m) => m.id === message.id)) {
        set({ messages: [...messages, message] });
      }

      // Refresh conversations to update last message
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to send media message:', error);
      throw error;
    }
  },

  sendKlipyMediaMessage: async (
    klipyMedia: {
      slug: string;
      type: 'gif' | 'sticker';
      media_url: string;
      blur_preview?: string;
      width?: number;
      height?: number;
      duration_seconds?: number;
      size_bytes?: number;
      thumbnail_url?: string;
    },
    caption?: string
  ) => {
    const { activeConversationId } = get();

    if (!activeConversationId) return;

    try {
      const message = await dmService.sendKlipyMediaMessage(
        activeConversationId,
        klipyMedia,
        caption
      );

      // Optimistically add the message if not already present
      const { messages } = get();
      if (!messages.find((m) => m.id === message.id)) {
        set({ messages: [...messages, message] });
      }

      // Refresh conversations to update last message
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to send KLIPY media message:', error);
      throw error;
    }
  },

  markAsRead: async () => {
    const { activeConversationId } = get();

    if (!activeConversationId) return;

    try {
      await dmService.markAsRead(activeConversationId);

      // Update local state
      set((state) => ({
        messages: state.messages.map((m) => ({
          ...m,
          is_read: true,
          delivery_status: 'read' as const,
          read_at: m.read_at || new Date().toISOString(),
        })),
        conversations: state.conversations.map((c) =>
          c.id === activeConversationId ? { ...c, unread_count: 0 } : c
        ),
      }));

      // Refresh unread count
      get().fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  },

  addMessage: (message: DirectMessage) => {
    const { messages, activeConversationId } = get();

    // Only add if it's for the active conversation and not duplicate
    if (message.conversation_id === activeConversationId) {
      if (!messages.find((m) => m.id === message.id)) {
        // Mark incoming messages from others as delivered
        const updatedMessage = {
          ...message,
          delivery_status: message.delivery_status || 'delivered',
        };
        set({ messages: [...messages, updatedMessage] });
      }
    }
  },

  updateMessageDeliveryStatus: (messageId: string, status: 'delivered' | 'read') => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId
          ? {
              ...m,
              delivery_status: status,
              is_read: status === 'read',
              read_at: status === 'read' ? new Date().toISOString() : m.read_at,
            }
          : m
      ),
    }));
  },

  deleteMessage: async (messageId: string, mode: 'me' | 'everyone') => {
    try {
      if (mode === 'everyone') {
        // For "delete for everyone", call the API to delete from database
        await dmService.deleteMessage(messageId, mode);
      }

      // For both modes, mark message as deleted in local state but keep it in array
      // This allows showing "message deleted" placeholder
      set((state) => {
        const deletedIds = new Set(state.deletedMessageIds);
        deletedIds.add(messageId);

        return {
          deletedMessageIds: deletedIds,
        };
      });

      // Refresh conversations to update last message
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  },

  markAsDelivered: async (messageIds: string[]) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      // Update local state immediately
      set((state) => ({
        messages: state.messages.map((m) =>
          messageIds.includes(m.id) && m.sender_id !== user.id
            ? {
                ...m,
                delivery_status: 'delivered' as const,
                delivered_at: new Date().toISOString(),
              }
            : m
        ),
      }));

      // Note: Backend API call to mark as delivered would go here
      // This would typically be done via a database function or trigger
    } catch (error) {
      console.error('Failed to mark messages as delivered:', error);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await dmService.getUnreadCount();
      set({ unreadCount: count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  subscribeToConversations: (userId: string) => {
    const { conversationsChannel } = get();

    // Cleanup existing subscription
    if (conversationsChannel) {
      dmService.unsubscribe(conversationsChannel);
    }

    const channel = dmService.subscribeToConversations(userId, () => {
      // Refresh conversations and unread count on any update
      get().fetchConversations();
      get().fetchUnreadCount();
    });

    set({ conversationsChannel: channel });
  },

  subscribeToActiveConversation: () => {
    const { activeConversationId, messagesChannel, readStatusChannel } = get();

    if (!activeConversationId) return;

    // Cleanup existing subscriptions
    if (messagesChannel) {
      dmService.unsubscribe(messagesChannel);
    }
    if (readStatusChannel) {
      dmService.unsubscribe(readStatusChannel);
    }

    // Subscribe to new messages
    const msgChannel = dmService.subscribeToConversation(activeConversationId, (message) => {
      get().addMessage(message);
      // Mark as read if this is the active conversation
      get().markAsRead();
    });

    // Subscribe to read status updates
    const readChannel = dmService.subscribeToReadStatus(
      activeConversationId,
      (messageId, isRead) => {
        get().updateMessageDeliveryStatus(messageId, isRead ? 'read' : 'delivered');
      }
    );

    set({
      messagesChannel: msgChannel,
      readStatusChannel: readChannel,
    });
  },

  unsubscribeAll: () => {
    const { conversationsChannel, messagesChannel, readStatusChannel } = get();

    if (conversationsChannel) {
      dmService.unsubscribe(conversationsChannel);
    }
    if (messagesChannel) {
      dmService.unsubscribe(messagesChannel);
    }
    if (readStatusChannel) {
      dmService.unsubscribe(readStatusChannel);
    }

    set({
      conversationsChannel: null,
      messagesChannel: null,
      readStatusChannel: null,
    });
  },

  reset: () => {
    get().unsubscribeAll();
    set(initialState);
  },
}));
