-- Quick migration to add KLIPY support
-- Run this in your Supabase SQL Editor or via psql

-- Step 1: Add new message types
ALTER TABLE public.dm_messages
  DROP CONSTRAINT IF EXISTS dm_messages_message_type_check;

ALTER TABLE public.dm_messages
  ADD CONSTRAINT dm_messages_message_type_check 
  CHECK (message_type IN ('text', 'image', 'video', 'gif', 'meme', 'sticker', 'clip'));

-- Step 2: Add KLIPY columns
ALTER TABLE public.dm_messages
  ADD COLUMN IF NOT EXISTS klipy_slug TEXT,
  ADD COLUMN IF NOT EXISTS klipy_blur_preview TEXT;

-- Step 3: Add indexes
CREATE INDEX IF NOT EXISTS idx_dm_messages_klipy_slug 
  ON public.dm_messages(klipy_slug) 
  WHERE klipy_slug IS NOT NULL;

-- Done!
SELECT 'KLIPY migration completed successfully!' as status;
