-- Allow public read access to contact and general settings
-- This enables the footer and contact page to fetch settings without authentication

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admin can view system_settings" ON system_settings;

-- Create new policies with public read for specific categories
CREATE POLICY "Public can view contact settings" ON system_settings
  FOR SELECT USING (
    category IN ('general', 'contact')
  );

CREATE POLICY "Admin can view all system_settings" ON system_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Keep admin-only update and insert policies
-- (These already exist from previous migration)
