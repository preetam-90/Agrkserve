-- Test if the update_system_setting function works

-- 1. Check if function exists
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname = 'update_system_setting';

-- 2. Test updating a field
SELECT update_system_setting(
  'support_email_primary',
  '"test@example.com"'::jsonb
);

-- 3. Verify it was updated
SELECT key, value
FROM system_settings
WHERE key = 'support_email_primary';

-- 4. Change it back
SELECT update_system_setting(
  'support_email_primary',
  '"support@agriServe.com"'::jsonb
);

-- 5. Verify again
SELECT key, value
FROM system_settings
WHERE key = 'support_email_primary';
