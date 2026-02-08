
export interface SystemSettings {
  platform_name: string;
  platform_version: string;
  environment: string;
  
  // Primary Contact
  support_email_primary: string;
  support_email_secondary: string;
  sales_email: string;
  support_phone_primary: string;
  support_phone_secondary: string;
  whatsapp_number: string;
  toll_free_number: string;
  
  // Business Address
  business_address_line1: string;
  business_address_line2: string;
  business_city: string;
  business_state: string;
  business_country: string;
  business_postal_code: string;
  
  // Additional Contact
  fax_number: string;
  emergency_contact: string;
  
  // Social Media
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  tiktok_url: string;
  pinterest_url: string;
  
  // Messaging Apps
  telegram_username: string;
  discord_server: string;
  slack_workspace: string;
  
  // Business Hours
  business_hours_weekday: string;
  business_hours_saturday: string;
  business_hours_sunday: string;
  timezone: string;
  
  // Additional Info
  company_registration: string;
  tax_id: string;
  website_url: string;
  support_portal_url: string;
  help_center_url: string;
  
  // Map & Location
  google_maps_url: string;
  latitude: string;
  longitude: string;
  
  // Legacy/Backward Compatibility
  support_email?: string;
  support_phone?: string;
  business_address?: string;
  social_links?: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  
  session_timeout: number;
}

// Cache for settings to avoid repeated API calls
let settingsCache: SystemSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch system settings from the database
 * Uses caching to minimize database calls
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  const now = Date.now();
  
  // Return cached settings if still valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 Returning cached settings (age:', Math.round((now - cacheTimestamp) / 1000), 'seconds)');
    return settingsCache;
  }

  console.log('🌐 Fetching fresh settings from API...');
  try {
    // Use public endpoint that doesn't require authentication
    const response = await fetch('/api/settings');
    const data = await response.json();

    console.log('📊 API Response:', {
      hasSettings: !!data.settings,
      fieldCount: data.settings ? Object.keys(data.settings).length : 0,
      sampleFields: data.settings ? {
        support_email_primary: data.settings.support_email_primary,
        support_phone_primary: data.settings.support_phone_primary,
        business_address_line1: data.settings.business_address_line1,
      } : null,
    });

    if (data.settings) {
      settingsCache = {
        platform_name: data.settings.platform_name || 'AgriServe',
        platform_version: data.settings.platform_version || '1.0.0',
        environment: data.settings.environment || 'production',
        
        // Primary Contact
        support_email_primary: data.settings.support_email_primary || data.settings.support_email || 'support@agriServe.com',
        support_email_secondary: data.settings.support_email_secondary || 'info@agriServe.com',
        sales_email: data.settings.sales_email || 'sales@agriServe.com',
        support_phone_primary: data.settings.support_phone_primary || data.settings.support_phone || '+1-555-0123',
        support_phone_secondary: data.settings.support_phone_secondary || '+1-555-0124',
        whatsapp_number: data.settings.whatsapp_number || '+1-555-0123',
        toll_free_number: data.settings.toll_free_number || '1-800-AGRISERVE',
        
        // Business Address
        business_address_line1: data.settings.business_address_line1 || '123 Farm Road',
        business_address_line2: data.settings.business_address_line2 || 'Suite 100',
        business_city: data.settings.business_city || 'Agriculture City',
        business_state: data.settings.business_state || 'AC',
        business_country: data.settings.business_country || 'United States',
        business_postal_code: data.settings.business_postal_code || '12345',
        
        // Additional Contact
        fax_number: data.settings.fax_number || '',
        emergency_contact: data.settings.emergency_contact || '+1-555-HELP',
        
        // Social Media
        facebook_url: data.settings.facebook_url || data.settings.social_links?.facebook || '',
        twitter_url: data.settings.twitter_url || data.settings.social_links?.twitter || '',
        instagram_url: data.settings.instagram_url || data.settings.social_links?.instagram || '',
        linkedin_url: data.settings.linkedin_url || data.settings.social_links?.linkedin || '',
        youtube_url: data.settings.youtube_url || '',
        tiktok_url: data.settings.tiktok_url || '',
        pinterest_url: data.settings.pinterest_url || '',
        
        // Messaging Apps
        telegram_username: data.settings.telegram_username || '',
        discord_server: data.settings.discord_server || '',
        slack_workspace: data.settings.slack_workspace || '',
        
        // Business Hours
        business_hours_weekday: data.settings.business_hours_weekday || 'Monday - Friday: 9:00 AM - 6:00 PM',
        business_hours_saturday: data.settings.business_hours_saturday || 'Saturday: 10:00 AM - 4:00 PM',
        business_hours_sunday: data.settings.business_hours_sunday || 'Sunday: Closed',
        timezone: data.settings.timezone || 'America/New_York',
        
        // Additional Info
        company_registration: data.settings.company_registration || '',
        tax_id: data.settings.tax_id || '',
        website_url: data.settings.website_url || 'https://agriServe.com',
        support_portal_url: data.settings.support_portal_url || 'https://support.agriServe.com',
        help_center_url: data.settings.help_center_url || 'https://help.agriServe.com',
        
        // Map & Location
        google_maps_url: data.settings.google_maps_url || '',
        latitude: data.settings.latitude || '',
        longitude: data.settings.longitude || '',
        
        session_timeout: data.settings.session_timeout || 3600,
      };
      cacheTimestamp = now;
      console.log('✅ Settings cached successfully');
      return settingsCache;
    }
  } catch (error) {
    console.error('❌ Error fetching system settings:', error);
  }

  console.log('⚠️ Returning default settings (API failed)');
  // Return default settings if fetch fails
  return {
    platform_name: 'AgriServe',
    platform_version: '1.0.0',
    environment: 'production',
    support_email_primary: 'support@agriServe.com',
    support_email_secondary: 'info@agriServe.com',
    sales_email: 'sales@agriServe.com',
    support_phone_primary: '+1-555-0123',
    support_phone_secondary: '+1-555-0124',
    whatsapp_number: '+1-555-0123',
    toll_free_number: '1-800-AGRISERVE',
    business_address_line1: '123 Farm Road',
    business_address_line2: 'Suite 100',
    business_city: 'Agriculture City',
    business_state: 'AC',
    business_country: 'United States',
    business_postal_code: '12345',
    fax_number: '',
    emergency_contact: '+1-555-HELP',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    youtube_url: '',
    tiktok_url: '',
    pinterest_url: '',
    telegram_username: '',
    discord_server: '',
    slack_workspace: '',
    business_hours_weekday: 'Monday - Friday: 9:00 AM - 6:00 PM',
    business_hours_saturday: 'Saturday: 10:00 AM - 4:00 PM',
    business_hours_sunday: 'Sunday: Closed',
    timezone: 'America/New_York',
    company_registration: '',
    tax_id: '',
    website_url: 'https://agriServe.com',
    support_portal_url: 'https://support.agriServe.com',
    help_center_url: 'https://help.agriServe.com',
    google_maps_url: '',
    latitude: '',
    longitude: '',
    session_timeout: 3600,
  };
}

/**
 * Clear the settings cache
 * Call this after updating settings in admin panel
 */
export function clearSettingsCache() {
  console.log('🗑️ Clearing settings cache');
  settingsCache = null;
  cacheTimestamp = 0;
  console.log('✅ Settings cache cleared - next fetch will be fresh');
}

/**
 * Get contact information specifically
 */
export async function getContactInfo() {
  console.log('📞 Getting contact info...');
  const settings = await getSystemSettings();
  
  // Build full address from components
  const addressParts = [
    settings.business_address_line1,
    settings.business_address_line2,
    settings.business_city,
    settings.business_state,
    settings.business_postal_code,
    settings.business_country,
  ].filter(Boolean);
  
  const contactInfo = {
    // Primary Contact
    email: settings.support_email_primary,
    emailSecondary: settings.support_email_secondary,
    salesEmail: settings.sales_email,
    phone: settings.support_phone_primary,
    phoneSecondary: settings.support_phone_secondary,
    whatsapp: settings.whatsapp_number,
    tollFree: settings.toll_free_number,
    fax: settings.fax_number,
    emergency: settings.emergency_contact,
    
    // Address
    address: addressParts.join(', '),
    addressLine1: settings.business_address_line1,
    addressLine2: settings.business_address_line2,
    city: settings.business_city,
    state: settings.business_state,
    country: settings.business_country,
    postalCode: settings.business_postal_code,
    
    // Social Media
    social: {
      facebook: settings.facebook_url,
      twitter: settings.twitter_url,
      instagram: settings.instagram_url,
      linkedin: settings.linkedin_url,
      youtube: settings.youtube_url,
      tiktok: settings.tiktok_url,
      pinterest: settings.pinterest_url,
    },
    
    // Messaging
    messaging: {
      telegram: settings.telegram_username,
      discord: settings.discord_server,
      slack: settings.slack_workspace,
    },
    
    // Business Hours
    hours: {
      weekday: settings.business_hours_weekday,
      saturday: settings.business_hours_saturday,
      sunday: settings.business_hours_sunday,
      timezone: settings.timezone,
    },
    
    // Additional
    website: settings.website_url,
    supportPortal: settings.support_portal_url,
    helpCenter: settings.help_center_url,
    companyRegistration: settings.company_registration,
    taxId: settings.tax_id,
    
    // Location
    googleMaps: settings.google_maps_url,
    latitude: settings.latitude,
    longitude: settings.longitude,
  };
  
  console.log('📞 Contact info prepared:', {
    email: contactInfo.email,
    phone: contactInfo.phone,
    address: contactInfo.address,
  });
  
  return contactInfo;
}
