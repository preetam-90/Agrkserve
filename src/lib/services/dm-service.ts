import { createClient } from '@/lib/supabase/client';
import type { DirectMessage, DMConversation } from '@/lib/types';

const supabase = createClient();

export const dmService = {
  /**
   * Get or create a conversation between two users
   * Uses database function to ensure uniqueness
   */
  async getOrCreateConversation(otherUserId: string): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user_1: user.id,
        user_2: otherUserId,
      });

      if (error) {
        console.error('getOrCreateConversation RPC error:', error);
        throw new Error(
          `Failed to create conversation: ${error.message || error.code || 'Unknown error'}`
        );
      }

      if (!data) {
        throw new Error('No conversation ID returned from database');
      }

      return data as string;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(`Unexpected error creating conversation: ${JSON.stringify(err)}`);
    }
  },

  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<DMConversation[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_user_conversations', {
      user_uuid: user.id,
    });

    if (error) throw error;
    return (data || []) as DMConversation[];
  },

  /**
   * Get a single conversation by ID
   */
  async getConversation(conversationId: string): Promise<DMConversation | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dm_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching conversation:', error);
      throw error;
    }

    // Fetch participant profiles separately
    const otherUserId =
      data.participant_1_id === user.id ? data.participant_2_id : data.participant_1_id;

    const { data: otherUser } = await supabase
      .from('user_profiles')
      .select('id, name, profile_image')
      .eq('id', otherUserId)
      .single();

    return {
      ...data,
      other_user_id: otherUserId,
      other_user_name: otherUser?.name || 'Unknown User',
      other_user_avatar: otherUser?.profile_image,
      other_participant: otherUser,
    } as DMConversation;
  },

  /**
   * Get conversation by other user ID
   */
  async getConversationByUser(otherUserId: string): Promise<DMConversation | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Order the IDs to match the database constraint
    const [p1, p2] = user.id < otherUserId ? [user.id, otherUserId] : [otherUserId, user.id];

    const { data, error } = await supabase
      .from('dm_conversations')
      .select('*')
      .eq('participant_1_id', p1)
      .eq('participant_2_id', p2)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching conversation by user:', error);
      throw error;
    }

    // Fetch other user profile
    const { data: otherUser } = await supabase
      .from('user_profiles')
      .select('id, name, profile_image')
      .eq('id', otherUserId)
      .single();

    return {
      ...data,
      other_user_id: otherUserId,
      other_user_name: otherUser?.name || 'Unknown User',
      other_user_avatar: otherUser?.profile_image,
      other_participant: otherUser,
    } as DMConversation;
  },

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    beforeId?: string
  ): Promise<DirectMessage[]> {
    let query = supabase
      .from('dm_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (beforeId) {
      // Get the timestamp of the reference message for cursor pagination
      const { data: refMessage } = await supabase
        .from('dm_messages')
        .select('created_at')
        .eq('id', beforeId)
        .single();

      if (refMessage) {
        query = query.lt('created_at', refMessage.created_at);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    // Fetch sender profiles for all messages
    const messages = data || [];
    if (messages.length > 0) {
      const senderIds = [...new Set(messages.map((m) => m.sender_id))];
      const { data: senders } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image')
        .in('id', senderIds);

      const senderMap = new Map(senders?.map((s) => [s.id, s]) || []);

      return messages
        .map((m) => ({
          ...m,
          delivery_status: m.is_read ? ('read' as const) : ('delivered' as const),
          delivered_at: null,
          sender: senderMap.get(m.sender_id) || null,
        }))
        .reverse() as DirectMessage[];
    }

    return [];
  },

  /**
   * Send a message
   */
  async sendMessage(conversationId: string, content: string): Promise<DirectMessage> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('dm_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw new Error(
          `Failed to send message: ${error.message || error.code || 'Unknown error'}`
        );
      }

      if (!data) {
        throw new Error('No message data returned after sending');
      }

      // Fetch sender profile
      const { data: sender } = await supabase
        .from('user_profiles')
        .select('id, name, profile_image')
        .eq('id', user.id)
        .single();

      return {
        ...data,
        delivery_status: 'sent',
        sender,
      } as DirectMessage;
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(`Unexpected error sending message: ${JSON.stringify(err)}`);
    }
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('mark_messages_as_read', {
      conv_id: conversationId,
      reader_id: user.id,
    });

    if (error) throw error;
    return data as number;
  },

  /**
   * Get total unread message count
   */
  async getUnreadCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase.rpc('get_unread_dm_count', {
      user_uuid: user.id,
    });

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
    return (data as number) || 0;
  },

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToConversation(conversationId: string, onMessage: (message: DirectMessage) => void) {
    return supabase
      .channel(`dm_messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch sender details
          const { data: sender } = await supabase
            .from('user_profiles')
            .select('id, name, profile_image')
            .eq('id', payload.new.sender_id)
            .single();

          const message: DirectMessage = {
            ...(payload.new as Omit<DirectMessage, 'sender'>),
            delivery_status: payload.new.is_read ? 'read' : 'delivered',
            sender: sender
              ? {
                  id: sender.id,
                  name: sender.name,
                  profile_image: sender.profile_image,
                }
              : null,
          };

          onMessage(message);
        }
      )
      .subscribe();
  },

  /**
   * Subscribe to message read status updates
   */
  subscribeToReadStatus(
    conversationId: string,
    onUpdate: (messageId: string, isRead: boolean) => void
  ) {
    return supabase
      .channel(`dm_read_status:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dm_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Check for read status changes
          if (payload.new.is_read !== payload.old.is_read) {
            onUpdate(payload.new.id, payload.new.is_read);
          }
        }
      )
      .subscribe();
  },

  /**
   * Subscribe to all conversation updates (for inbox)
   */
  subscribeToConversations(userId: string, onUpdate: () => void) {
    // Subscribe to conversations where user is a participant
    return supabase
      .channel(`dm_conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dm_conversations',
        },
        (payload) => {
          // Check if user is a participant
          const conv = payload.new as DMConversation;
          if (conv.participant_1_id === userId || conv.participant_2_id === userId) {
            onUpdate();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dm_messages',
        },
        async (payload) => {
          // Check if message is in user's conversation
          const { data } = await supabase
            .from('dm_conversations')
            .select('id')
            .eq('id', payload.new.conversation_id)
            .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
            .single();

          if (data) {
            onUpdate();
          }
        }
      )
      .subscribe();
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    return channel.unsubscribe();
  },
};
