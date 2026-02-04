-- ============================================================================
-- Contact Information System - Verification Script
-- Run this in Supabase SQL Editor to verify everything is set up correctly
-- ============================================================================

-- 1. Check if system_settings table exists
SELECT 
  'system_settings table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. Check if contact fields exist in database
SELECT 
  'Contact fields count' as check_name,
  COUNT(*) as total_fields,
  CASE 
    WHEN COUNT(*) >= 40 THEN '✅ GOOD (40+ fields)'
    WHEN COUNT(*) > 0 THEN '⚠️ PARTIAL (some fields missing)'
    ELSE '❌ NONE (run ADD_EXTENDED_CONTACT_FIELDS.sql)'
  END as status
FROM system_settings
WHERE category = 'contact';

-- 3. List all contact fields with their values
SELECT 
  key,
  value,
  updated_at,
  CASE 
    WHEN value IS NULL OR value = 'null'::jsonb THEN '⚠️ Empty'
    ELSE '✅ Has value'
  END as has_value
FROM system_settings
WHERE category = 'contact'
ORDER BY key;

-- 4. Check if RPC functions exist
SELECT 
  'get_system_settings function' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_system_settings')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING (run SETUP_ADMIN_SETTINGS.sql)'
  END as status
UNION ALL
SELECT 
  'update_system_setting function' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_system_setting')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING (run SETUP_ADMIN_SETTINGS.sql)'
  END as status;

-- 5. Test get_system_settings RPC function
SELECT 
  'Test get_system_settings()' as test_name,
  COUNT(*) as fields_returned,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ WORKING'
    ELSE '❌ NOT WORKING'
  END as status
FROM get_system_settings('contact');

-- 6. Check RLS policies for public access
SELECT 
  policyname,
  cmd,
  qual,
  CASE 
    WHEN policyname LIKE '%public%' OR policyname LIKE '%read%' THEN '✅ Public access'
    ELSE '⚠️ Check policy'
  END as access_level
FROM pg_policies
WHERE tablename = 'system_settings'
ORDER BY policyname;

-- 7. Check if Realtime is enabled (requires superuser)
-- Note: This query might fail if you don't have superuser access
-- In that case, check manually in Supabase Dashboard → Database → Replication
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN tablename = 'system_settings' THEN '✅ Found'
    ELSE '⚠️ Check Supabase Dashboard'
  END as realtime_status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'system_settings';

-- 8. Sample contact data (first 5 fields)
SELECT 
  'Sample Data' as section,
  key,
  value
FROM system_settings
WHERE category = 'contact'
ORDER BY key
LIMIT 5;

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- 
-- 1. system_settings table: ✅ EXISTS
-- 2. Contact fields count: ✅ GOOD (40+ fields)
-- 3. All contact fields listed with values
-- 4. Both RPC functions: ✅ EXISTS
-- 5. get_system_settings test: ✅ WORKING
-- 6. RLS policies showing public read access
-- 7. Realtime enabled (or check Dashboard)
-- 8. Sample data showing actual values
--
-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
--
-- If system_settings table is MISSING:
--   → Run: supabase/migrations/023_admin_settings_tables.sql
--   → Or run: SETUP_ADMIN_SETTINGS.sql
--
-- If contact fields count is 0 or low:
--   → Run: ADD_EXTENDED_CONTACT_FIELDS.sql
--
-- If RPC functions are MISSING:
--   → Run: SETUP_ADMIN_SETTINGS.sql
--
-- If RLS policies are missing:
--   → Run: supabase/migrations/024_public_settings_access.sql
--
-- If Realtime is not enabled:
--   → Go to Supabase Dashboard
--   → Navigate to Database → Replication
--   → Find system_settings table
--   → Enable replication
--   → Click Save
--
-- ============================================================================

-- Quick fix: Insert sample contact data if missing
-- Uncomment and run if you need to add test data:

/*
INSERT INTO system_settings (key, value, category) VALUES
  ('support_email_primary', '"support@agriServe.com"'::jsonb, 'contact'),
  ('support_phone_primary', '"+1-555-0123"'::jsonb, 'contact'),
  ('business_address_line1', '"123 Farm Road"'::jsonb, 'contact'),
  ('business_city', '"Agriculture City"'::jsonb, 'contact'),
  ('business_state', '"AC"'::jsonb, 'contact'),
  ('business_country', '"United States"'::jsonb, 'contact'),
  ('business_postal_code', '"12345"'::jsonb, 'contact')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
*/

-- Test update function (uncomment to test):
/*
SELECT update_system_setting(
  'support_email_primary',
  '"test@example.com"'::jsonb
);

-- Verify it was updated:
SELECT key, value FROM system_settings WHERE key = 'support_email_primary';
*/
