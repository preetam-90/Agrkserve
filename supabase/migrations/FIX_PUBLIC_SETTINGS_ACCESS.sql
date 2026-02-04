-- ============================================================================
-- Fix Public Access to Contact/General Settings
-- This allows the /api/settings endpoint to work without authentication
-- ============================================================================

-- Drop the old function
DROP FUNCTION IF EXISTS get_system_settings(TEXT);

-- Recreate with public access for contact/general categories
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
  -- Allow public access for contact and general categories
  IF p_category IN ('contact', 'general') OR p_category IS NULL THEN
    -- Public access - no auth check needed
    RETURN QUERY
    SELECT 
      s.key,
      s.value,
      s.category,
      s.updated_at
    FROM system_settings s
    WHERE (p_category IS NULL OR s.category = p_category)
      AND s.category IN ('contact', 'general')  -- Only return public categories
    ORDER BY s.category, s.key;
  ELSE
    -- For other categories, require admin access
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
  END IF;
END;
$$;

-- Grant execute to everyone (including anonymous users)
GRANT EXECUTE ON FUNCTION get_system_settings TO anon;
GRANT EXECUTE ON FUNCTION get_system_settings TO authenticated;

-- Also update the update_system_setting function to use roles array
DROP FUNCTION IF EXISTS update_system_setting(TEXT, JSONB);

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
  -- Check if user is admin (using roles array)
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Insert or update the setting
  INSERT INTO system_settings (key, value)
  VALUES (p_key, p_value)
  ON CONFLICT (key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- Grant execute to authenticated users only (admin check is inside function)
GRANT EXECUTE ON FUNCTION update_system_setting TO authenticated;

-- ============================================================================
-- Verification
-- ============================================================================

-- Test public access (should work without being logged in)
SELECT key, value FROM get_system_settings('contact') LIMIT 5;

-- Test general category
SELECT key, value FROM get_system_settings('general') LIMIT 5;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Public settings access has been fixed!';
  RAISE NOTICE '✅ Contact and general settings are now publicly accessible';
  RAISE NOTICE '✅ Other categories still require admin access';
  RAISE NOTICE '✅ Functions now use roles array instead of role column';
END $$;
