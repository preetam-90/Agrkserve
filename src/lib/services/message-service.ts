import { createClient } from '@/lib/supabase/client';
import type { Message, Conversation } from '@/lib/types';

const supabase = createClient();

export const messageService = {
  // Get conversation by ID
  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        booking:bookings(id, equipment_id, status)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get conversation by booking ID
  async getConversationByBooking(bookingId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        booking:bookings(id, equipment_id, status)
      `)
      .eq('booking_id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get user's conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        booking:bookings(id, equipment_id, status, equipment:equipment(title, images))
      `)
      .contains('participant_ids', [userId])
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    // Fetch participant details
    if (data && data.length > 0) {
      const allParticipantIds = [...new Set(data.flatMap((c) => c.participant_ids))];
      const { data: participants } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .in('id', allParticipantIds);

      return data.map((conversation) => ({
        ...conversation,
        participants: participants?.filter((p) => conversation.participant_ids.includes(p.id)) || [],
      }));
    }

    return data || [];
  },

  // Get messages for a conversation
  async getMessages(
    conversationId: string,
    limit: number = 50,
    beforeId?: string
  ): Promise<Message[]> {
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:user_profiles!sender_id(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (beforeId) {
      const { data: beforeMessage } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', beforeId)
        .single();

      if (beforeMessage) {
        query = query.lt('created_at', beforeMessage.created_at);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).reverse(); // Return in chronological order
  },

  // Create or get conversation for a booking
  async getOrCreateConversation(
    bookingId: string,
    participantIds: string[]
  ): Promise<Conversation> {
    // Check if conversation exists
    const existing = await this.getConversationByBooking(bookingId);
    if (existing) return existing;

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        booking_id: bookingId,
        participant_ids: participantIds,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select(`
        *,
        sender:user_profiles!sender_id(id, full_name, avatar_url)
      `)
      .single();

    if (error) throw error;

    // Update conversation's last message
    await supabase
      .from('conversations')
      .update({
        last_message: content.substring(0, 100),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return data;
  },

  // Mark messages as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Get unread message count
  async getUnreadCount(userId: string): Promise<number> {
    // Get user's conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .contains('participant_ids', [userId]);

    if (!conversations || conversations.length === 0) return 0;

    const conversationIds = conversations.map((c) => c.id);

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  // Subscribe to new messages in a conversation
  subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch full message with sender details
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:user_profiles!sender_id(id, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            onMessage(data);
          }
        }
      )
      .subscribe();
  },

  // Unsubscribe from messages
  unsubscribeFromMessages(conversationId: string) {
    return supabase.channel(`messages:${conversationId}`).unsubscribe();
  },
};
