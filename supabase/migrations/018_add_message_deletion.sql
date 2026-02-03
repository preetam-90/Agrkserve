-- =====================================================
-- MIGRATION: Add Message Deletion Support
-- =====================================================
-- This migration adds DELETE policy to allow message deletion
-- =====================================================

-- =====================================================
-- STEP 1: Add DELETE policy for dm_messages table
-- =====================================================
-- Allow users to delete their own messages (sender only)
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.dm_messages;

CREATE POLICY "Users can delete their own messages"
  ON public.dm_messages
  FOR DELETE
  USING (auth.uid() = sender_id);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this query to verify the policy:
-- SELECT policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'dm_messages';
