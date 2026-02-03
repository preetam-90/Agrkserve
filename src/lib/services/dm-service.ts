import { createClient } from '@/lib/supabase/client';
import type { DirectMessage, DMConversation } from '@/lib/types';

const supabase = createClient();

// Helper functions for media metadata
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

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
          message_type: 'text',
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
   * Send a media message (image or video)
   */
  async sendMediaMessage(
    conversationId: string,
    file: File,
    mediaType: 'image' | 'video',
    caption?: string
  ): Promise<DirectMessage> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${conversationId}/${timestamp}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading media:', uploadError);
        throw new Error(`Failed to upload media: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(filePath);

      // Get image/video dimensions
      let width: number | undefined;
      let height: number | undefined;
      let duration: number | undefined;
      let thumbnailUrl: string | undefined;

      if (mediaType === 'image') {
        const dimensions = await getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      } else if (mediaType === 'video') {
        const metadata = await getVideoMetadata(file);
        width = metadata.width;
        height = metadata.height;
        duration = Math.round(metadata.duration);

        // For videos, we could generate a thumbnail here
        // For now, we'll skip thumbnail generation server-side
      }

      // Insert message
      const { data, error } = await supabase
        .from('dm_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: caption?.trim() || null,
          message_type: mediaType,
          media_url: urlData.publicUrl,
          media_thumbnail_url: thumbnailUrl || null,
          media_size_bytes: file.size,
          media_duration_seconds: duration || null,
          media_width: width || null,
          media_height: height || null,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error sending media message:', error);
        // Clean up uploaded file on error
        await supabase.storage.from('chat-media').remove([filePath]);
        throw new Error(`Failed to send media message: ${error.message}`);
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
      throw new Error(`Unexpected error sending media message: ${JSON.stringify(err)}`);
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
   * Send a KLIPY media message (GIF, Sticker)
   */
  async sendKlipyMediaMessage(
    conversationId: string,
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
  ): Promise<DirectMessage> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      // Track share with KLIPY API (non-blocking)
      try {
        const { klipyService } = await import('@/lib/services/klipy-service');
        await klipyService.share({
          slug: klipyMedia.slug,
          customer_id: user.id,
          platform: 'web',
        });
      } catch (shareError) {
        console.warn('KLIPY share tracking failed (non-critical):', shareError);
      }

      // Build insert data - conditionally include KLIPY fields if columns exist
      const insertData: any = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: caption?.trim() || null,
        message_type: klipyMedia.type,
        media_url: klipyMedia.media_url,
        media_thumbnail_url: klipyMedia.thumbnail_url || null,
        media_size_bytes: klipyMedia.size_bytes || null,
        media_duration_seconds: klipyMedia.duration_seconds || null,
        media_width: klipyMedia.width || null,
        media_height: klipyMedia.height || null,
      };

      // Try to add KLIPY fields (will be ignored if columns don't exist)
      try {
        insertData.klipy_slug = klipyMedia.slug;
        insertData.klipy_blur_preview = klipyMedia.blur_preview || null;
      } catch (e) {
        // KLIPY columns don't exist yet - that's OK, migration pending
      }

      // Insert message
      const { data, error } = await supabase
        .from('dm_messages')
        .insert(insertData)
        .select('*')
        .single();

      if (error) {
        console.error('Error sending KLIPY media message:', error);

        // If error is about unknown columns, provide helpful message
        if (
          error.message?.includes('klipy_slug') ||
          error.message?.includes('klipy_blur_preview')
        ) {
          throw new Error(
            'Database migration needed. Please run: KLIPY_QUICK_MIGRATION.sql in Supabase SQL Editor'
          );
        }

        throw new Error(`Failed to send KLIPY media message: ${error.message}`);
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
      throw new Error(`Unexpected error sending KLIPY media message: ${JSON.stringify(err)}`);
    }
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
   * Delete a message
   * Supports both "delete for me" and "delete for everyone" modes
   */
  async deleteMessage(messageId: string, mode: 'me' | 'everyone'): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('=== Delete Message Debug ===');
    console.log('Message ID:', messageId);
    console.log('Mode:', mode);
    console.log('User ID:', user.id);

    try {
      if (mode === 'everyone') {
        // Hard delete the message (remove from database)
        // Only sender can delete for everyone
        const { error, data } = await supabase
          .from('dm_messages')
          .delete()
          .eq('id', messageId)
          .eq('sender_id', user.id)
          .select();

        console.log('Delete result:', { error, data });

        if (error) {
          console.error('Error deleting message:', error);
          throw new Error(`Failed to delete message: ${error.message}`);
        }

        console.log('Message deleted successfully');
      } else {
        // For "delete for me", we'll use client-side filtering
        // The message remains in the database but is hidden from the user
        // No database operation needed - the store will handle filtering
        console.log('Delete for me - skipping database operation');
      }
    } catch (err) {
      console.error('Delete message exception:', err);
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(`Unexpected error deleting message: ${JSON.stringify(err)}`);
    }
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    return channel.unsubscribe();
  },
};
