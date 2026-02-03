-- =====================================================
-- ADD MEDIA SUPPORT TO DM MESSAGES
-- =====================================================

-- Add media columns to dm_messages table
ALTER TABLE public.dm_messages
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video')),
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS media_size_bytes BIGINT,
  ADD COLUMN IF NOT EXISTS media_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS media_width INTEGER,
  ADD COLUMN IF NOT EXISTS media_height INTEGER;

-- Make content nullable since media messages might not have text
ALTER TABLE public.dm_messages ALTER COLUMN content DROP NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.dm_messages.message_type IS 'Type of message: text, image, or video';
COMMENT ON COLUMN public.dm_messages.media_url IS 'URL to the media file in storage';
COMMENT ON COLUMN public.dm_messages.media_thumbnail_url IS 'Thumbnail URL for videos';
COMMENT ON COLUMN public.dm_messages.media_size_bytes IS 'File size in bytes';
COMMENT ON COLUMN public.dm_messages.media_duration_seconds IS 'Duration for video messages';
COMMENT ON COLUMN public.dm_messages.media_width IS 'Width of image/video';
COMMENT ON COLUMN public.dm_messages.media_height IS 'Height of image/video';

-- Add index for media messages
CREATE INDEX IF NOT EXISTS idx_dm_messages_media_type ON public.dm_messages(message_type) WHERE message_type != 'text';

-- Update the last message preview function to handle media messages
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  preview_text TEXT;
BEGIN
  -- Generate preview based on message type
  IF NEW.message_type = 'image' THEN
    preview_text := '📷 Photo';
  ELSIF NEW.message_type = 'video' THEN
    preview_text := '🎥 Video';
  ELSE
    preview_text := LEFT(COALESCE(NEW.content, ''), 100);
  END IF;

  UPDATE public.dm_conversations
  SET 
    last_message = preview_text,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- DONE: Media support added to DM messages
-- =====================================================
