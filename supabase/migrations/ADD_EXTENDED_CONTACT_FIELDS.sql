-- ============================================================================
-- ADD EXTENDED CONTACT FIELDS ONLY
-- Run this if you already have the basic setup and just need the extra fields
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

-- Verify the fields were added
SELECT 'Extended contact fields added successfully!' as status;
SELECT COUNT(*) as total_contact_fields FROM system_settings WHERE category = 'contact';
SELECT key FROM system_settings WHERE category = 'contact' ORDER BY key;
