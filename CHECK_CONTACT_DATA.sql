-- Check what contact data exists in your database

-- 1. Count contact fields
SELECT 
  'Contact fields count' as check_name,
  COUNT(*) as count
FROM system_settings
WHERE category = 'contact';

-- 2. List all contact fields
SELECT key, value, category
FROM system_settings
WHERE category = 'contact'
ORDER BY key;

-- 3. Check if the fields from ADD_EXTENDED_CONTACT_FIELDS.sql exist
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM system_settings WHERE key = 'support_email_primary') 
    THEN '✅ support_email_primary exists'
    ELSE '❌ support_email_primary missing'
  END as email_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM system_settings WHERE key = 'business_address_line1') 
    THEN '✅ business_address_line1 exists'
    ELSE '❌ business_address_line1 missing'
  END as address_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM system_settings WHERE key = 'facebook_url') 
    THEN '✅ facebook_url exists'
    ELSE '❌ facebook_url missing'
  END as social_check;
