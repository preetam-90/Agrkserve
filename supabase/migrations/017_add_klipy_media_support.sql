-- =====================================================
-- ADD KLIPY MEDIA SUPPORT TO DM MESSAGES
-- GIFs, Memes, Stickers, and Clips from KLIPY API
-- =====================================================

-- Update message_type to include KLIPY media types
ALTER TABLE public.dm_messages
  DROP CONSTRAINT IF EXISTS dm_messages_message_type_check;

ALTER TABLE public.dm_messages
  ADD CONSTRAINT dm_messages_message_type_check 
  CHECK (message_type IN ('text', 'image', 'video', 'gif', 'meme', 'sticker', 'clip'));

-- Add KLIPY-specific metadata columns
ALTER TABLE public.dm_messages
  ADD COLUMN IF NOT EXISTS klipy_slug TEXT,
  ADD COLUMN IF NOT EXISTS klipy_blur_preview TEXT;

-- Add indexes for KLIPY media
CREATE INDEX IF NOT EXISTS idx_dm_messages_klipy_slug ON public.dm_messages(klipy_slug) WHERE klipy_slug IS NOT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.dm_messages.message_type IS 'Type of message: text, image, video, gif (KLIPY), meme (KLIPY), sticker (KLIPY), or clip (KLIPY)';
COMMENT ON COLUMN public.dm_messages.klipy_slug IS 'KLIPY media slug for tracking and analytics';
COMMENT ON COLUMN public.dm_messages.klipy_blur_preview IS 'Base64 encoded blur preview from KLIPY for instant display';

-- Update the last message preview function to handle KLIPY media types
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
  ELSIF NEW.message_type = 'gif' THEN
    preview_text := '🎬 GIF';
  ELSIF NEW.message_type = 'meme' THEN
    preview_text := '😄 Meme';
  ELSIF NEW.message_type = 'sticker' THEN
    preview_text := '✨ Sticker';
  ELSIF NEW.message_type = 'clip' THEN
    preview_text := '🎵 Clip';
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

-- Optional: Create a view for KLIPY media analytics
CREATE OR REPLACE VIEW dm_klipy_media_stats AS
SELECT 
  message_type,
  COUNT(*) as total_sent,
  COUNT(DISTINCT sender_id) as unique_senders,
  COUNT(DISTINCT conversation_id) as unique_conversations
FROM public.dm_messages
WHERE message_type IN ('gif', 'meme', 'sticker', 'clip')
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY message_type;

COMMENT ON VIEW dm_klipy_media_stats IS 'Statistics on KLIPY media usage in the last 30 days';

-- =====================================================
-- DONE: KLIPY media support added to DM messages
-- =====================================================
