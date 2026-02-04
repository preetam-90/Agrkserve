-- Extended Contact Information
-- Add comprehensive contact fields to system_settings

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

-- Update the old social_links to individual fields (migration helper)
-- This helps transition from the old format to new format
DO $$
DECLARE
  social_data JSONB;
BEGIN
  -- Get existing social_links if they exist
  SELECT value INTO social_data FROM system_settings WHERE key = 'social_links';
  
  IF social_data IS NOT NULL THEN
    -- Update individual social media fields from the old social_links object
    UPDATE system_settings SET value = social_data->>'facebook' WHERE key = 'facebook_url' AND (social_data->>'facebook') IS NOT NULL;
    UPDATE system_settings SET value = social_data->>'twitter' WHERE key = 'twitter_url' AND (social_data->>'twitter') IS NOT NULL;
    UPDATE system_settings SET value = social_data->>'instagram' WHERE key = 'instagram_url' AND (social_data->>'instagram') IS NOT NULL;
    UPDATE system_settings SET value = social_data->>'linkedin' WHERE key = 'linkedin_url' AND (social_data->>'linkedin') IS NOT NULL;
  END IF;
END $$;
