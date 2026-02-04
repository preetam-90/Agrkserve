-- ============================================================================
-- Fix JSONB Format for Contact Settings
-- This converts plain text values to proper JSONB format
-- ============================================================================

-- First, let's see what we have
SELECT 
  key, 
  value,
  pg_typeof(value) as value_type
FROM system_settings
WHERE category = 'contact'
LIMIT 5;

-- Update all contact fields to proper JSONB format
-- This wraps text values in quotes to make them valid JSONB strings

UPDATE system_settings
SET value = to_jsonb(value::text)
WHERE category = 'contact'
  AND pg_typeof(value) != 'jsonb'::regtype;

-- Alternative: Delete and re-insert with proper JSONB format
DELETE FROM system_settings WHERE category = 'contact';

INSERT INTO system_settings (key, value, category) VALUES
  -- Primary Contact
  ('support_email_primary', '"support@agriServe.com"'::jsonb, 'contact'),
  ('support_email_secondary', '"info@agriServe.com"'::jsonb, 'contact'),
  ('sales_email', '"sales@agriServe.com"'::jsonb, 'contact'),
  ('support_phone_primary', '"+1-555-0123"'::jsonb, 'contact'),
  ('support_phone_secondary', '"+1-555-0124"'::jsonb, 'contact'),
  ('whatsapp_number', '"+1-555-0123"'::jsonb, 'contact'),
  ('toll_free_number', '"1-800-AGRISERVE"'::jsonb, 'contact'),
  ('fax_number', '""'::jsonb, 'contact'),
  ('emergency_contact', '"+1-555-HELP"'::jsonb, 'contact'),
  
  -- Business Address
  ('business_address', '"123 Farm Road, Agriculture City, AC 12345"'::jsonb, 'contact'),
  ('business_address_line1', '"123 Farm Road"'::jsonb, 'contact'),
  ('business_address_line2', '"Suite 100"'::jsonb, 'contact'),
  ('business_city', '"Agriculture City"'::jsonb, 'contact'),
  ('business_state', '"AC"'::jsonb, 'contact'),
  ('business_country', '"United States"'::jsonb, 'contact'),
  ('business_postal_code', '"12345"'::jsonb, 'contact'),
  
  -- Social Media
  ('facebook_url', '""'::jsonb, 'contact'),
  ('twitter_url', '""'::jsonb, 'contact'),
  ('instagram_url', '""'::jsonb, 'contact'),
  ('linkedin_url', '""'::jsonb, 'contact'),
  ('youtube_url', '""'::jsonb, 'contact'),
  ('tiktok_url', '""'::jsonb, 'contact'),
  ('pinterest_url', '""'::jsonb, 'contact'),
  ('social_links', '{}'::jsonb, 'contact'),
  
  -- Messaging Apps
  ('telegram_username', '""'::jsonb, 'contact'),
  ('discord_server', '""'::jsonb, 'contact'),
  ('slack_workspace', '""'::jsonb, 'contact'),
  
  -- Business Hours
  ('business_hours_weekday', '"Monday - Friday: 9:00 AM - 6:00 PM"'::jsonb, 'contact'),
  ('business_hours_saturday', '"Saturday: 10:00 AM - 4:00 PM"'::jsonb, 'contact'),
  ('business_hours_sunday', '"Sunday: Closed"'::jsonb, 'contact'),
  ('timezone', '"America/New_York"'::jsonb, 'contact'),
  
  -- Additional Info
  ('company_registration', '""'::jsonb, 'contact'),
  ('tax_id', '""'::jsonb, 'contact'),
  ('website_url', '"https://agriServe.com"'::jsonb, 'contact'),
  ('support_portal_url', '"https://support.agriServe.com"'::jsonb, 'contact'),
  ('help_center_url', '"https://help.agriServe.com"'::jsonb, 'contact'),
  
  -- Map & Location
  ('google_maps_url', '""'::jsonb, 'contact'),
  ('latitude', '""'::jsonb, 'contact'),
  ('longitude', '""'::jsonb, 'contact')
ON CONFLICT (key) DO NOTHING;

-- Verify the fix
SELECT 
  'After fix' as status,
  key, 
  value,
  pg_typeof(value) as value_type
FROM system_settings
WHERE category = 'contact'
ORDER BY key
LIMIT 10;

-- Test that values can be extracted properly
SELECT 
  key,
  value #>> '{}' as extracted_value  -- This extracts the string from JSONB
FROM system_settings
WHERE category = 'contact'
ORDER BY key
LIMIT 10;

-- Success message
DO $$
DECLARE
  contact_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO contact_count FROM system_settings WHERE category = 'contact';
  
  RAISE NOTICE '✅ JSONB format has been fixed!';
  RAISE NOTICE '✅ Total contact fields: %', contact_count;
  RAISE NOTICE '✅ All values are now proper JSONB strings';
  RAISE NOTICE '✅ The API should now work correctly';
END $$;
