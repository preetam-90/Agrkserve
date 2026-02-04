-- ============================================================================
-- ADMIN SETTINGS COMPLETE SETUP
-- Run this entire file in Supabase SQL Editor
-- ============================================================================

-- Step 1: Create Tables
-- ============================================================================

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Maintenance Mode Table
CREATE TABLE IF NOT EXISTS maintenance_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN DEFAULT FALSE,
  message TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  whitelisted_ips TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Active Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- System Health Logs Table
CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metadata JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Insert Default Settings
-- ============================================================================

INSERT INTO system_settings (key, value, category) VALUES
  ('platform_name', '"AgriServe"', 'general'),
  ('platform_version', '"1.0.0"', 'general'),
  ('environment', '"production"', 'general'),
  ('support_email', '"support@agriServe.com"', 'contact'),
  ('support_phone', '"+1-555-0123"', 'contact'),
  ('business_address', '"123 Farm Road, Agriculture City, AC 12345"', 'contact'),
  ('social_links', '{"facebook": "", "twitter": "", "linkedin": "", "instagram": ""}', 'contact'),
  ('session_timeout', '3600', 'security'),
  ('max_sessions_per_user', '5', 'security')
ON CONFLICT (key) DO NOTHING;

-- Insert default maintenance mode record
INSERT INTO maintenance_mode (is_enabled, message, whitelisted_ips)
VALUES (FALSE, 'We are currently performing scheduled maintenance. Please check back soon.', ARRAY[]::TEXT[])
ON CONFLICT DO NOTHING;

-- Step 3: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_health_logs_recorded_at ON system_health_logs(recorded_at DESC);

-- Step 4: Enable RLS
-- ============================================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop Old Policies (if they exist)
-- ============================================================================

DROP POLICY IF EXISTS "Admin can view system_settings" ON system_settings;
DROP POLICY IF EXISTS "Admin can update system_settings" ON system_settings;
DROP POLICY IF EXISTS "Admin can insert system_settings" ON system_settings;
DROP POLICY IF EXISTS "Public can view contact settings" ON system_settings;
DROP POLICY IF EXISTS "Admin can view all system_settings" ON system_settings;

-- Step 6: Create RLS Policies
-- ============================================================================

-- Public can view contact and general settings
CREATE POLICY "Public can view contact settings" ON system_settings
  FOR SELECT USING (
    category IN ('general', 'contact')
  );

-- Admin can view all settings
CREATE POLICY "Admin can view all system_settings" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

-- Admin can update settings
CREATE POLICY "Admin can update system_settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

-- Admin can insert settings
CREATE POLICY "Admin can insert system_settings" ON system_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

-- Maintenance mode policies
CREATE POLICY "Admin can view maintenance_mode" ON maintenance_mode
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

CREATE POLICY "Admin can update maintenance_mode" ON maintenance_mode
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

-- Session policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can view all sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

CREATE POLICY "Admin can delete sessions" ON user_sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

-- Health logs policies
CREATE POLICY "Admin can view system_health_logs" ON system_health_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND ('admin' = ANY(user_profiles.roles))
    )
  );

CREATE POLICY "System can insert health logs" ON system_health_logs
  FOR INSERT WITH CHECK (true);

-- Step 7: Create RPC Functions
-- ============================================================================

-- Get system settings by category
CREATE OR REPLACE FUNCTION get_system_settings(p_category TEXT DEFAULT NULL)
RETURNS TABLE (
  key TEXT,
  value JSONB,
  category TEXT,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    s.key,
    s.value,
    s.category,
    s.updated_at
  FROM system_settings s
  WHERE p_category IS NULL OR s.category = p_category
  ORDER BY s.category, s.key;
END;
$$;

-- Update system setting
CREATE OR REPLACE FUNCTION update_system_setting(
  p_key TEXT,
  p_value JSONB
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  UPDATE system_settings
  SET 
    value = p_value,
    updated_at = NOW(),
    updated_by = auth.uid()
  WHERE key = p_key;

  RETURN FOUND;
END;
$$;

-- Get maintenance mode status
CREATE OR REPLACE FUNCTION get_maintenance_mode()
RETURNS TABLE (
  is_enabled BOOLEAN,
  message TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  whitelisted_ips TEXT[]
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.is_enabled,
    m.message,
    m.scheduled_start,
    m.scheduled_end,
    m.whitelisted_ips
  FROM maintenance_mode m
  ORDER BY m.updated_at DESC
  LIMIT 1;
END;
$$;

-- Update maintenance mode
CREATE OR REPLACE FUNCTION update_maintenance_mode(
  p_is_enabled BOOLEAN,
  p_message TEXT DEFAULT NULL,
  p_scheduled_start TIMESTAMPTZ DEFAULT NULL,
  p_scheduled_end TIMESTAMPTZ DEFAULT NULL,
  p_whitelisted_ips TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  UPDATE maintenance_mode
  SET 
    is_enabled = p_is_enabled,
    message = COALESCE(p_message, message),
    scheduled_start = p_scheduled_start,
    scheduled_end = p_scheduled_end,
    whitelisted_ips = COALESCE(p_whitelisted_ips, whitelisted_ips),
    updated_at = NOW(),
    updated_by = auth.uid();

  RETURN FOUND;
END;
$$;

-- Get active sessions with user info
CREATE OR REPLACE FUNCTION get_active_sessions()
RETURNS TABLE (
  session_id UUID,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    s.id as session_id,
    s.user_id,
    up.name as user_name,
    up.email as user_email,
    s.ip_address,
    s.user_agent,
    s.last_activity,
    s.created_at,
    s.expires_at
  FROM user_sessions s
  JOIN user_profiles up ON s.user_id = up.id
  WHERE s.expires_at > NOW()
  ORDER BY s.last_activity DESC;
END;
$$;

-- Revoke session
CREATE OR REPLACE FUNCTION revoke_session(p_session_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  DELETE FROM user_sessions WHERE id = p_session_id;
  RETURN FOUND;
END;
$$;

-- Revoke all sessions for a user
CREATE OR REPLACE FUNCTION revoke_user_sessions(p_user_id UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  DELETE FROM user_sessions WHERE user_id = p_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Force logout all users
CREATE OR REPLACE FUNCTION force_logout_all_users()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  DELETE FROM user_sessions;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Log system health metric
CREATE OR REPLACE FUNCTION log_system_health(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO system_health_logs (metric_name, metric_value, metadata)
  VALUES (p_metric_name, p_metric_value, p_metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Get system health metrics
CREATE OR REPLACE FUNCTION get_system_health_metrics(
  p_metric_name TEXT DEFAULT NULL,
  p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metadata JSONB,
  recorded_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    l.metric_name,
    l.metric_value,
    l.metadata,
    l.recorded_at
  FROM system_health_logs l
  WHERE 
    (p_metric_name IS NULL OR l.metric_name = p_metric_name)
    AND l.recorded_at > NOW() - (p_hours || ' hours')::INTERVAL
  ORDER BY l.recorded_at DESC;
END;
$$;

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Step 8: Grant Permissions
-- ============================================================================

GRANT EXECUTE ON FUNCTION get_system_settings TO authenticated;
GRANT EXECUTE ON FUNCTION update_system_setting TO authenticated;
GRANT EXECUTE ON FUNCTION get_maintenance_mode TO authenticated;
GRANT EXECUTE ON FUNCTION update_maintenance_mode TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_session TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_user_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION force_logout_all_users TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_health TO authenticated;
GRANT EXECUTE ON FUNCTION get_system_health_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions TO authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verify installation
SELECT 'Setup complete! Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_settings', 'maintenance_mode', 'user_sessions', 'system_health_logs');

SELECT 'Default settings inserted:' as status;
SELECT key, category FROM system_settings ORDER BY category, key;


-- ============================================================================
-- EXTENDED CONTACT INFORMATION (Run this after the main setup)
-- ============================================================================

-- Insert all additional contact information fields
INSERT INTO system_settings (key, value, category) VALUES
  -- Primary Contact
  ('support_email_primary', '"support@agriServe.com"', 'contact'),
  ('support_email_secondary', '"info@agriServe.com"', 'contact'),
  ('sales_email', '"sales@agriServe.com"', 'contact'),
  ('support_phone_primary', '"+1-555-0123"', 'contact'),
  ('support_phone_secondary', '"+1-555-0124"', 'contact'),
  ('whatsapp_number', '"+1-555-0123"', 'contact'),
  ('toll_free_number', '"1-800-AGRISERVE"', 'contact'),
  
  -- Business Address
  ('business_address_line1', '"123 Farm Road"', 'contact'),
  ('business_address_line2', '"Suite 100"', 'contact'),
  ('business_city', '"Agriculture City"', 'contact'),
  ('business_state', '"AC"', 'contact'),
  ('business_country', '"United States"', 'contact'),
  ('business_postal_code', '"12345"', 'contact'),
  
  -- Additional Contact Methods
  ('fax_number', '""', 'contact'),
  ('emergency_contact', '"+1-555-HELP"', 'contact'),
  
  -- Social Media (Extended)
  ('facebook_url', '""', 'contact'),
  ('twitter_url', '""', 'contact'),
  ('instagram_url', '""', 'contact'),
  ('linkedin_url', '""', 'contact'),
  ('youtube_url', '""', 'contact'),
  ('tiktok_url', '""', 'contact'),
  ('pinterest_url', '""', 'contact'),
  
  -- Messaging Apps
  ('telegram_username', '""', 'contact'),
  ('discord_server', '""', 'contact'),
  ('slack_workspace', '""', 'contact'),
  
  -- Business Hours
  ('business_hours_weekday', '"Monday - Friday: 9:00 AM - 6:00 PM"', 'contact'),
  ('business_hours_saturday', '"Saturday: 10:00 AM - 4:00 PM"', 'contact'),
  ('business_hours_sunday', '"Sunday: Closed"', 'contact'),
  ('timezone', '"America/New_York"', 'contact'),
  
  -- Additional Info
  ('company_registration', '""', 'contact'),
  ('tax_id', '""', 'contact'),
  ('website_url', '"https://agriServe.com"', 'contact'),
  ('support_portal_url', '"https://support.agriServe.com"', 'contact'),
  ('help_center_url', '"https://help.agriServe.com"', 'contact'),
  
  -- Map & Location
  ('google_maps_url', '""', 'contact'),
  ('latitude', '""', 'contact'),
  ('longitude', '""', 'contact')
ON CONFLICT (key) DO NOTHING;

SELECT 'Extended contact fields added!' as status;
SELECT COUNT(*) as total_contact_fields FROM system_settings WHERE category = 'contact';
