-- =====================================================
-- ADD REPLY FEATURE TO DIRECT MESSAGES
-- =====================================================
-- This migration adds the reply_to_id column to enable
-- message replies in the chat system
-- =====================================================

-- Add reply_to_id column to dm_messages table
ALTER TABLE dm_messages
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES dm_messages(id) ON DELETE SET NULL;

-- Create index for better query performance when fetching replied messages
CREATE INDEX IF NOT EXISTS idx_dm_messages_reply_to_id 
ON dm_messages(reply_to_id) 
WHERE reply_to_id IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN dm_messages.reply_to_id IS 'References the message being replied to, enabling threaded conversations';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the column was added successfully:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'dm_messages' AND column_name = 'reply_to_id';
