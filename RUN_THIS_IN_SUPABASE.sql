-- ================================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- Go to: Supabase Dashboard > SQL Editor > New Query
-- Paste this entire script and click RUN
-- ================================================

-- Step 1: Add new message types (gif, meme, sticker, clip)
DO $$ 
BEGIN
  ALTER TABLE public.dm_messages
    DROP CONSTRAINT IF EXISTS dm_messages_message_type_check;
    
  ALTER TABLE public.dm_messages
    ADD CONSTRAINT dm_messages_message_type_check 
    CHECK (message_type IN ('text', 'image', 'video', 'gif', 'meme', 'sticker', 'clip'));
    
  RAISE NOTICE 'Message types updated successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error updating message types: %', SQLERRM;
END $$;

-- Step 2: Add KLIPY columns if they don't exist
DO $$ 
BEGIN
  -- Add klipy_slug column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dm_messages' AND column_name = 'klipy_slug'
  ) THEN
    ALTER TABLE public.dm_messages ADD COLUMN klipy_slug TEXT;
    RAISE NOTICE 'Added klipy_slug column';
  ELSE
    RAISE NOTICE 'klipy_slug column already exists';
  END IF;

  -- Add klipy_blur_preview column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dm_messages' AND column_name = 'klipy_blur_preview'
  ) THEN
    ALTER TABLE public.dm_messages ADD COLUMN klipy_blur_preview TEXT;
    RAISE NOTICE 'Added klipy_blur_preview column';
  ELSE
    RAISE NOTICE 'klipy_blur_preview column already exists';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error adding columns: %', SQLERRM;
END $$;

-- Step 3: Add index for performance
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_dm_messages_klipy_slug 
    ON public.dm_messages(klipy_slug) 
    WHERE klipy_slug IS NOT NULL;
  RAISE NOTICE 'Index created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating index: %', SQLERRM;
END $$;

-- Step 4: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dm_messages'
  AND column_name IN ('klipy_slug', 'klipy_blur_preview', 'message_type')
ORDER BY column_name;

-- ================================================
-- SUCCESS! You should see:
-- - klipy_slug | text | YES
-- - klipy_blur_preview | text | YES  
-- - message_type | text or similar | NO
-- ================================================
