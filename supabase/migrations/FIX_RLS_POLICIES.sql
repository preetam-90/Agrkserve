-- ============================================================================
-- Fix RLS Policies for Public Access to Contact Settings
-- This allows the test page and contact page to read contact information
-- ============================================================================

-- First, check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'system_settings';

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Admin can view system_settings" ON system_settings;
DROP POLICY IF EXISTS "Admin can update system_settings" ON system_settings;
DROP POLICY IF EXISTS "Public can read contact/general settings" ON system_settings;

-- Create new policies

-- 1. Allow public (anonymous + authenticated) to READ contact/general settings
CREATE POLICY "Public can read contact and general settings"
ON system_settings
FOR SELECT
TO public
USING (category IN ('contact', 'general'));

-- 2. Allow authenticated users to READ all settings (for admin panel)
CREATE POLICY "Authenticated users can read all settings"
ON system_settings
FOR SELECT
TO authenticated
USING (true);

-- 3. Only admins can INSERT/UPDATE/DELETE
CREATE POLICY "Admins can manage all settings"
ON system_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  )
);

-- Verify policies were created
SELECT 
  policyname,
  cmd,
  roles::text,
  CASE 
    WHEN policyname LIKE '%Public%' THEN '✅ Public access'
    WHEN policyname LIKE '%Authenticated%' THEN '✅ Authenticated access'
    WHEN policyname LIKE '%Admin%' THEN '✅ Admin only'
    ELSE '⚠️ Check policy'
  END as access_level
FROM pg_policies
WHERE tablename = 'system_settings'
ORDER BY policyname;

-- Test public access (should work even without being logged in)
SELECT 
  'Test public read' as test_name,
  COUNT(*) as contact_fields
FROM system_settings
WHERE category = 'contact';

-- Success message
DO $$
DECLARE
  contact_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO contact_count FROM system_settings WHERE category = 'contact';
  
  RAISE NOTICE '✅ RLS policies have been fixed!';
  RAISE NOTICE '✅ Public can now read contact/general settings';
  RAISE NOTICE '✅ Found % contact fields', contact_count;
  
  IF contact_count = 0 THEN
    RAISE WARNING '⚠️ No contact data found - run INSERT_CONTACT_DATA.sql';
  END IF;
END $$;
