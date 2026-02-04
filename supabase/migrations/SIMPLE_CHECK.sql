-- Simple check to see what's in your database

-- 1. Check if table exists and has data
SELECT 
  'Total settings' as check_name,
  COUNT(*) as count
FROM system_settings;

-- 2. Check contact category specifically
SELECT 
  'Contact settings' as check_name,
  COUNT(*) as count
FROM system_settings
WHERE category = 'contact';

-- 3. Show first 10 contact fields
SELECT key, value, category
FROM system_settings
WHERE category = 'contact'
ORDER BY key
LIMIT 10;

-- 4. Test the RPC function
SELECT key, value
FROM get_system_settings('contact')
LIMIT 10;
