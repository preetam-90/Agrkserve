-- =====================================================
-- NOTIFICATION SYSTEM MIGRATION
-- =====================================================
-- This migration creates a comprehensive notification system
-- with support for real-time updates, preferences, and history

-- =====================================================
-- STEP 1: CLEAN UP - Drop everything first for clean slate
-- =====================================================
DROP TRIGGER IF EXISTS create_user_notification_preferences ON auth.users;
DROP FUNCTION IF EXISTS create_default_notification_preferences() CASCADE;
DROP FUNCTION IF EXISTS create_notification CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_notifications CASCADE;
DROP FUNCTION IF EXISTS get_unread_notification_count() CASCADE;
DROP FUNCTION IF EXISTS mark_all_notifications_read() CASCADE;
DROP FUNCTION IF EXISTS mark_notification_read CASCADE;

-- Drop tables in correct order (dependencies first)
DROP TABLE IF EXISTS notification_delivery_log CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Drop types
DROP TYPE IF EXISTS notification_delivery_channel CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS notification_category CASCADE;

-- =====================================================
-- STEP 2: CREATE ENUMS
-- =====================================================
CREATE TYPE notification_category AS ENUM (
  'booking',
  'payment',
  'message',
  'trust',
  'security',
  'insight',
  'system'
);

CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'critical'
);

CREATE TYPE notification_delivery_channel AS ENUM (
  'in_app',
  'email',
  'sms',
  'push'
);

-- =====================================================
-- STEP 3: CREATE NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category notification_category NOT NULL,
  event_type TEXT NOT NULL,
  priority notification_priority DEFAULT 'normal',
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Deep Linking
  action_url TEXT,
  action_label TEXT,
  
  -- Related Entities
  related_booking_id UUID,
  related_equipment_id UUID,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- Constraint
  CONSTRAINT valid_action_url CHECK (action_url IS NULL OR action_url ~ '^/.*')
);

-- Add foreign keys separately (handles missing tables gracefully)
DO $$ BEGIN
  ALTER TABLE notifications 
    ADD CONSTRAINT fk_notifications_booking 
    FOREIGN KEY (related_booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add booking FK: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER TABLE notifications 
    ADD CONSTRAINT fk_notifications_equipment 
    FOREIGN KEY (related_equipment_id) REFERENCES public.equipment(id) ON DELETE SET NULL;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Could not add equipment FK: %', SQLERRM;
END $$;

-- =====================================================
-- STEP 4: CREATE NOTIFICATION PREFERENCES TABLE
-- =====================================================
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Category Toggles
  booking_enabled BOOLEAN DEFAULT TRUE,
  payment_enabled BOOLEAN DEFAULT TRUE,
  message_enabled BOOLEAN DEFAULT TRUE,
  trust_enabled BOOLEAN DEFAULT TRUE,
  security_enabled BOOLEAN DEFAULT TRUE,
  insight_enabled BOOLEAN DEFAULT TRUE,
  system_enabled BOOLEAN DEFAULT TRUE,
  
  -- Delivery Channel Preferences
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'UTC',
  
  -- Emergency Override
  allow_critical_during_quiet BOOLEAN DEFAULT TRUE,
  
  -- Frequency Controls
  digest_mode BOOLEAN DEFAULT FALSE,
  digest_frequency TEXT DEFAULT 'immediate',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id)
);

-- =====================================================
-- STEP 5: CREATE NOTIFICATION DELIVERY LOG TABLE
-- =====================================================
CREATE TABLE notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel notification_delivery_channel NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 6: CREATE INDEXES
-- =====================================================
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_category ON notifications(category);
CREATE INDEX idx_notifications_event_type ON notifications(event_type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_booking ON notifications(related_booking_id) WHERE related_booking_id IS NOT NULL;
CREATE INDEX idx_notifications_equipment ON notifications(related_equipment_id) WHERE related_equipment_id IS NOT NULL;
CREATE INDEX idx_delivery_log_notification ON notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX idx_preferences_user ON notification_preferences(user_id);

-- =====================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: CREATE RLS POLICIES
-- =====================================================
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view delivery logs for their notifications"
  ON notification_delivery_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notifications
      WHERE notifications.id = notification_delivery_log.notification_id
      AND notifications.user_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 9: CREATE HELPER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid()
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = auth.uid()
    AND is_read = FALSE;
  
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RETURN affected_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM notifications
  WHERE user_id = auth.uid()
    AND is_read = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete old read notifications (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE is_read = TRUE
    AND read_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification with preferences check
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_category notification_category,
  p_event_type TEXT,
  p_priority notification_priority DEFAULT 'normal',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_related_booking_id UUID DEFAULT NULL,
  p_related_equipment_id UUID DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_prefs RECORD;
  v_should_create BOOLEAN := TRUE;
BEGIN
  -- Check user preferences
  SELECT * INTO v_prefs
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences exist, create default ones
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (p_user_id);
    v_should_create := TRUE;
  ELSE
    -- Check if category is enabled
    v_should_create := CASE p_category
      WHEN 'booking' THEN v_prefs.booking_enabled
      WHEN 'payment' THEN v_prefs.payment_enabled
      WHEN 'message' THEN v_prefs.message_enabled
      WHEN 'trust' THEN v_prefs.trust_enabled
      WHEN 'security' THEN v_prefs.security_enabled
      WHEN 'insight' THEN v_prefs.insight_enabled
      WHEN 'system' THEN v_prefs.system_enabled
      ELSE TRUE
    END;
    
    -- Check quiet hours (unless critical)
    IF v_prefs.quiet_hours_enabled AND p_priority != 'critical' THEN
      -- Simplified quiet hours check - can be enhanced
      v_should_create := NOT (v_prefs.allow_critical_during_quiet = FALSE);
    END IF;
  END IF;
  
  -- Create notification if allowed
  IF v_should_create THEN
    INSERT INTO notifications (
      user_id, title, message, category, event_type, priority,
      action_url, action_label, related_booking_id, related_equipment_id,
      related_user_id, metadata
    ) VALUES (
      p_user_id, p_title, p_message, p_category, p_event_type, p_priority,
      p_action_url, p_action_label, p_related_booking_id, p_related_equipment_id,
      p_related_user_id, p_metadata
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when user signs up
CREATE TRIGGER create_user_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not add notifications to realtime publication: %', SQLERRM;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notification_preferences;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not add notification_preferences to realtime publication: %', SQLERRM;
END $$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT SELECT ON notification_delivery_log TO authenticated;

GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert sample notifications
/*
INSERT INTO notifications (user_id, title, message, category, event_type, priority, action_url)
VALUES (
  auth.uid(),
  'Welcome to AgriServe!',
  'Start by listing your first equipment or browsing available rentals.',
  'system',
  'user.welcome',
  'normal',
  '/dashboard'
);
*/

COMMENT ON TABLE notifications IS 'Stores all user notifications with support for real-time updates';
COMMENT ON TABLE notification_preferences IS 'User-specific notification preferences and settings';
COMMENT ON TABLE notification_delivery_log IS 'Tracks notification delivery across different channels';
