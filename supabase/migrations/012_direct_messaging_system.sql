-- =====================================================
-- DIRECT MESSAGING SYSTEM MIGRATION (FIXED)
-- =====================================================

-- =====================================================
-- STEP 1: CLEAN UP
-- =====================================================
-- We drop tables with CASCADE first. This automatically drops 
-- the triggers and indexes associated with them.
DROP TABLE IF EXISTS public.dm_messages CASCADE;
DROP TABLE IF EXISTS public.dm_conversations CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_conversations(UUID) CASCADE;
DROP FUNCTION IF EXISTS mark_messages_as_read(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_unread_dm_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_dm_updated_at() CASCADE;

-- =====================================================
-- STEP 2: CREATE CONVERSATIONS TABLE
-- =====================================================
CREATE TABLE public.dm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Last message preview
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique conversation per user pair
  CONSTRAINT unique_conversation_pair UNIQUE (participant_1_id, participant_2_id),
  
  -- Ensure participant_1_id < participant_2_id for consistent ordering
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id),
  
  -- Prevent self-conversations
  CONSTRAINT no_self_conversation CHECK (participant_1_id != participant_2_id)
);

-- =====================================================
-- STEP 3: CREATE MESSAGES TABLE
-- =====================================================
CREATE TABLE public.dm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.dm_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message content
  content TEXT NOT NULL,
  
  -- Read status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 4: CREATE INDEXES
-- =====================================================
-- Conversation indexes
CREATE INDEX idx_dm_conversations_participant_1 ON public.dm_conversations(participant_1_id);
CREATE INDEX idx_dm_conversations_participant_2 ON public.dm_conversations(participant_2_id);
CREATE INDEX idx_dm_conversations_last_message_at ON public.dm_conversations(last_message_at DESC NULLS LAST);
CREATE INDEX idx_dm_conversations_updated_at ON public.dm_conversations(updated_at DESC);

-- Message indexes
CREATE INDEX idx_dm_messages_conversation_id ON public.dm_messages(conversation_id);
CREATE INDEX idx_dm_messages_sender_id ON public.dm_messages(sender_id);
CREATE INDEX idx_dm_messages_created_at ON public.dm_messages(created_at DESC);
CREATE INDEX idx_dm_messages_unread ON public.dm_messages(conversation_id, sender_id, is_read) WHERE is_read = FALSE;

-- =====================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user_1 UUID, user_2 UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p1 UUID;
  p2 UUID;
  conv_id UUID;
BEGIN
  -- Order the UUIDs to ensure consistent storage
  IF user_1 < user_2 THEN
    p1 := user_1;
    p2 := user_2;
  ELSE
    p1 := user_2;
    p2 := user_1;
  END IF;
  
  -- Check for existing conversation
  SELECT id INTO conv_id
  FROM public.dm_conversations
  WHERE participant_1_id = p1 AND participant_2_id = p2;
  
  -- Create new conversation if not exists
  IF conv_id IS NULL THEN
    INSERT INTO public.dm_conversations (participant_1_id, participant_2_id)
    VALUES (p1, p2)
    RETURNING id INTO conv_id;
  END IF;
  
  RETURN conv_id;
END;
$$;

-- Function to get conversations for a user with other participant details
CREATE OR REPLACE FUNCTION get_user_conversations(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_avatar TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID,
  unread_count BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    CASE 
      WHEN c.participant_1_id = user_uuid THEN c.participant_2_id
      ELSE c.participant_1_id
    END as other_user_id,
    COALESCE(
      CASE 
        WHEN c.participant_1_id = user_uuid THEN p2.name
        ELSE p1.name
      END,
      'Unknown User'
    ) as other_user_name,
    CASE 
      WHEN c.participant_1_id = user_uuid THEN p2.profile_image
      ELSE p1.profile_image
    END as other_user_avatar,
    c.last_message,
    c.last_message_at,
    c.last_message_sender_id,
    (
      SELECT COUNT(*)
      FROM public.dm_messages m
      WHERE m.conversation_id = c.id
        AND m.sender_id != user_uuid
        AND m.is_read = FALSE
    ) as unread_count,
    c.created_at
  FROM public.dm_conversations c
  -- NOTE: Ensure user_profiles table exists or this join will fail
  LEFT JOIN public.user_profiles p1 ON c.participant_1_id = p1.id
  LEFT JOIN public.user_profiles p2 ON c.participant_2_id = p2.id
  WHERE c.participant_1_id = user_uuid OR c.participant_2_id = user_uuid
  ORDER BY COALESCE(c.last_message_at, c.created_at) DESC;
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conv_id UUID, reader_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.dm_messages
  SET is_read = TRUE, read_at = NOW()
  WHERE conversation_id = conv_id
    AND sender_id != reader_id
    AND is_read = FALSE;
    
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Function to get total unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_dm_count(user_uuid UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM public.dm_messages m
  JOIN public.dm_conversations c ON m.conversation_id = c.id
  WHERE (c.participant_1_id = user_uuid OR c.participant_2_id = user_uuid)
    AND m.sender_id != user_uuid
    AND m.is_read = FALSE;
    
  RETURN total_count;
END;
$$;

-- =====================================================
-- STEP 6: CREATE TRIGGERS
-- =====================================================

-- Trigger to update conversation last message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.dm_conversations
  SET 
    last_message = LEFT(NEW.content, 100),
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON public.dm_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_dm_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_dm_messages_updated_at
  BEFORE UPDATE ON public.dm_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_dm_updated_at();

CREATE TRIGGER update_dm_conversations_updated_at
  BEFORE UPDATE ON public.dm_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_dm_updated_at();

-- =====================================================
-- STEP 7: ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view their own conversations"
  ON public.dm_conversations FOR SELECT
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations they're part of"
  ON public.dm_conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can update their own conversations"
  ON public.dm_conversations FOR UPDATE
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Message policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.dm_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dm_conversations c
      WHERE c.id = dm_messages.conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.dm_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.dm_conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages they received"
  ON public.dm_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.dm_conversations c
      WHERE c.id = dm_messages.conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dm_conversations c
      WHERE c.id = dm_messages.conversation_id
        AND (c.participant_1_id = auth.uid() OR c.participant_2_id = auth.uid())
    )
  );

-- =====================================================
-- STEP 8: ENABLE REALTIME
-- =====================================================
-- Note: Check if publication exists first, or just run these
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;

-- =====================================================
-- STEP 9: GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.dm_conversations TO authenticated;
GRANT ALL ON public.dm_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_conversations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_as_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_dm_count(UUID) TO authenticated;

-- =====================================================
-- STEP 10: CREATE MESSAGE NOTIFICATION TRIGGER
-- =====================================================
-- This trigger creates a notification when a new DM is sent

CREATE OR REPLACE FUNCTION create_dm_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  conv RECORD;
BEGIN
  -- Get conversation details
  SELECT * INTO conv FROM public.dm_conversations WHERE id = NEW.conversation_id;
  
  -- Determine recipient (the other participant)
  IF conv.participant_1_id = NEW.sender_id THEN
    recipient_id := conv.participant_2_id;
  ELSE
    recipient_id := conv.participant_1_id;
  END IF;
  
  -- Get sender name
  SELECT COALESCE(name, 'Someone') INTO sender_name 
  FROM public.user_profiles 
  WHERE id = NEW.sender_id;
  
  -- Create notification for recipient
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    category,
    event_type,
    priority,
    action_url,
    action_label,
    related_user_id,
    metadata
  ) VALUES (
    recipient_id,
    'New message from ' || sender_name,
    LEFT(NEW.content, 100),
    'message',
    'dm_received',
    'normal',
    '/messages/' || NEW.conversation_id,
    'View Message',
    NEW.sender_id,
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id
    )
  );
  
  RETURN NEW;
EXCEPTION WHEN others THEN
  -- Don't fail message insert if notification fails
  RAISE WARNING 'Failed to create DM notification: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Only create trigger if notifications table exists
DO $$ BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    DROP TRIGGER IF EXISTS create_dm_notification_trigger ON public.dm_messages;
    CREATE TRIGGER create_dm_notification_trigger
      AFTER INSERT ON public.dm_messages
      FOR EACH ROW
      EXECUTE FUNCTION create_dm_notification();
  END IF;
END $$;

-- =====================================================
-- DONE: Direct messaging system is ready!
-- =====================================================