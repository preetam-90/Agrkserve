-- Migration: Fix embedding_queue trigger permissions
-- Description: The notify_knowledge_change trigger function needs SECURITY DEFINER
--              to insert into embedding_queue table which has RLS enabled for service_role only.
-- Created: 2026-02-19

-- ============================================================================
-- Fix: Recreate the trigger function with SECURITY DEFINER
-- This allows the function to execute with the privileges of the function owner
-- instead of the calling user, bypassing RLS for the embedding_queue insert.
-- ============================================================================

-- Drop existing triggers first (they depend on the function)
DROP TRIGGER IF EXISTS trg_equipment_knowledge_change ON equipment;
DROP TRIGGER IF EXISTS trg_user_profiles_knowledge_change ON user_profiles;
DROP TRIGGER IF EXISTS trg_labour_profiles_knowledge_change ON labour_profiles;
DROP TRIGGER IF EXISTS trg_reviews_knowledge_change ON reviews;

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS notify_knowledge_change();

CREATE OR REPLACE FUNCTION notify_knowledge_change()
RETURNS TRIGGER
SECURITY DEFINER  -- Key change: function runs with owner privileges, not caller privileges
SET search_path = public
AS $$
DECLARE
  src_type TEXT;
  src_id UUID;
  action_type TEXT;
BEGIN
  -- Determine source type from table name
  CASE TG_TABLE_NAME
    WHEN 'equipment' THEN src_type := 'equipment';
    WHEN 'user_profiles' THEN src_type := 'user';
    WHEN 'labour_profiles' THEN src_type := 'labour';
    WHEN 'reviews' THEN src_type := 'review';
    ELSE src_type := TG_TABLE_NAME;
  END CASE;

  -- Get the record ID and action
  IF TG_OP = 'DELETE' THEN
    src_id := OLD.id;
    action_type := 'delete';
  ELSE
    src_id := NEW.id;
    action_type := LOWER(TG_OP);
  END IF;

  -- Insert into embedding queue for async processing
  INSERT INTO embedding_queue (source_type, source_id, action, processed)
  VALUES (src_type, src_id, action_type, FALSE)
  ON CONFLICT DO NOTHING;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers
CREATE TRIGGER trg_equipment_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();

CREATE TRIGGER trg_user_profiles_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();

CREATE TRIGGER trg_labour_profiles_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON labour_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();

CREATE TRIGGER trg_reviews_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();

-- ============================================================================
-- Grant execute permission on the function to authenticated users
-- This is necessary because SECURITY DEFINER functions still require
-- execute permission to be called by users.
-- ============================================================================
GRANT EXECUTE ON FUNCTION notify_knowledge_change() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_knowledge_change() TO anon;

-- ============================================================================
-- Alternative/additional fix: Add policy for authenticated users to insert into embedding_queue
-- This provides defense-in-depth in case the SECURITY DEFINER approach has issues
-- ============================================================================
DROP POLICY IF EXISTS "Allow authenticated insert on embedding_queue" ON embedding_queue;
CREATE POLICY "Allow authenticated insert on embedding_queue"
  ON embedding_queue
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- Note: To apply this migration:
-- 1. Run this SQL in your Supabase SQL Editor, OR
-- 2. If using Supabase CLI: npx supabase db push
-- ============================================================================
