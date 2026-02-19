-- Migration: Add booking embedding trigger support
-- Description: Updates notify_knowledge_change() to map 'bookings' table → 'booking' source_type,
--              and adds a trigger on the bookings table to auto-queue embedding updates.
-- Created: 2026-02-18
-- Depends on: 028_pgvector_rag_setup.sql, 029_auto_sync_triggers.sql

-- ============================================================================
-- 1. Update trigger function to handle the bookings table
--    The existing ELSE branch would set src_type = 'bookings' (wrong).
--    We need src_type = 'booking' (singular) to match the knowledge_embeddings check constraint.
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_knowledge_change()
RETURNS TRIGGER AS $$
DECLARE
  src_type TEXT;
  src_id UUID;
  action_type TEXT;
BEGIN
  -- Map table name to source_type (must match knowledge_embeddings CHECK constraint)
  CASE TG_TABLE_NAME
    WHEN 'equipment'       THEN src_type := 'equipment';
    WHEN 'user_profiles'   THEN src_type := 'user';
    WHEN 'labour_profiles' THEN src_type := 'labour';
    WHEN 'reviews'         THEN src_type := 'review';
    WHEN 'bookings'        THEN src_type := 'booking';
    ELSE src_type := TG_TABLE_NAME;
  END CASE;

  -- Determine record ID and operation type
  IF TG_OP = 'DELETE' THEN
    src_id      := OLD.id;
    action_type := 'delete';
  ELSE
    src_id      := NEW.id;
    action_type := LOWER(TG_OP);  -- 'insert' or 'update'
  END IF;

  -- Enqueue for async embedding generation
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

-- ============================================================================
-- 2. Create trigger on bookings table
--    Fires after any INSERT, UPDATE, or DELETE so status/amount changes
--    are immediately queued for re-embedding.
-- ============================================================================
DROP TRIGGER IF EXISTS trg_bookings_knowledge_change ON bookings;
CREATE TRIGGER trg_bookings_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();
