-- Migration: Auto-sync triggers for embedding queue
-- Description: Creates database triggers that automatically queue embedding updates
--              when equipment, user_profiles, labour_profiles, or reviews change.
-- Created: 2026-02-18

-- ============================================================================
-- 1. Create the trigger function
-- Inserts into embedding_queue when tracked tables change
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_knowledge_change()
RETURNS TRIGGER AS $$
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

-- ============================================================================
-- 2. Create triggers on tracked tables
-- ============================================================================

-- Equipment trigger
DROP TRIGGER IF EXISTS trg_equipment_knowledge_change ON equipment;
CREATE TRIGGER trg_equipment_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();

-- User profiles trigger
DROP TRIGGER IF EXISTS trg_user_profiles_knowledge_change ON user_profiles;
CREATE TRIGGER trg_user_profiles_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();

-- Labour profiles trigger
DROP TRIGGER IF EXISTS trg_labour_profiles_knowledge_change ON labour_profiles;
CREATE TRIGGER trg_labour_profiles_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON labour_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();

-- Reviews trigger
DROP TRIGGER IF EXISTS trg_reviews_knowledge_change ON reviews;
CREATE TRIGGER trg_reviews_knowledge_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_knowledge_change();
