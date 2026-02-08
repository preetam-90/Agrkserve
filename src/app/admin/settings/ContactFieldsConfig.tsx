import React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Globe,
  Clock,
  Building,
  FileText,
  MessageCircle,
  Send,
  Hash,
  Smartphone,
  Printer,
  AlertCircle,
} from 'lucide-react';

export interface ContactField {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
  category: string;
  required?: boolean;
}

export const contactFieldsConfig: ContactField[] = [
  // Primary Contact
  {
    key: 'support_email_primary',
    label: 'Primary Support Email',
    icon: Mail,
    type: 'email',
    placeholder: 'support@company.com',
    category: 'Primary Contact',
    required: true,
  },
  {
    key: 'support_email_secondary',
    label: 'Secondary Support Email',
    icon: Mail,
    type: 'email',
    placeholder: 'info@company.com',
    category: 'Primary Contact',
  },
  {
    key: 'sales_email',
    label: 'Sales Email',
    icon: Mail,
    type: 'email',
    placeholder: 'sales@company.com',
    category: 'Primary Contact',
  },
  {
    key: 'support_phone_primary',
    label: 'Primary Phone',
    icon: Phone,
    type: 'tel',
    placeholder: '+1-555-0123',
    category: 'Primary Contact',
    required: true,
  },
  {
    key: 'support_phone_secondary',
    label: 'Secondary Phone',
    icon: Phone,
    type: 'tel',
    placeholder: '+1-555-0124',
    category: 'Primary Contact',
  },
  {
    key: 'whatsapp_number',
    label: 'WhatsApp Number',
    icon: MessageCircle,
    type: 'tel',
    placeholder: '+1-555-0123',
    category: 'Primary Contact',
  },
  {
    key: 'toll_free_number',
    label: 'Toll-Free Number',
    icon: Phone,
    type: 'tel',
    placeholder: '1-800-COMPANY',
    category: 'Primary Contact',
  },
  {
    key: 'fax_number',
    label: 'Fax Number',
    icon: Printer,
    type: 'tel',
    placeholder: '+1-555-0125',
    category: 'Primary Contact',
  },
  {
    key: 'emergency_contact',
    label: 'Emergency Contact',
    icon: AlertCircle,
    type: 'tel',
    placeholder: '+1-555-HELP',
    category: 'Primary Contact',
  },

  // Business Address
  {
    key: 'business_address_line1',
    label: 'Address Line 1',
    icon: MapPin,
    type: 'text',
    placeholder: '123 Main Street',
    category: 'Business Address',
    required: true,
  },
  {
    key: 'business_address_line2',
    label: 'Address Line 2',
    icon: MapPin,
    type: 'text',
    placeholder: 'Suite 100',
    category: 'Business Address',
  },
  {
    key: 'business_city',
    label: 'City',
    icon: Building,
    type: 'text',
    placeholder: 'New York',
    category: 'Business Address',
    required: true,
  },
  {
    key: 'business_state',
    label: 'State/Province',
    icon: Building,
    type: 'text',
    placeholder: 'NY',
    category: 'Business Address',
  },
  {
    key: 'business_postal_code',
    label: 'Postal Code',
    icon: Hash,
    type: 'text',
    placeholder: '10001',
    category: 'Business Address',
  },
  {
    key: 'business_country',
    label: 'Country',
    icon: Globe,
    type: 'text',
    placeholder: 'United States',
    category: 'Business Address',
    required: true,
  },

  // Social Media
  {
    key: 'facebook_url',
    label: 'Facebook URL',
    icon: Facebook,
    type: 'url',
    placeholder: 'https://facebook.com/yourpage',
    category: 'Social Media',
  },
  {
    key: 'twitter_url',
    label: 'Twitter/X URL',
    icon: Twitter,
    type: 'url',
    placeholder: 'https://twitter.com/yourhandle',
    category: 'Social Media',
  },
  {
    key: 'instagram_url',
    label: 'Instagram URL',
    icon: Instagram,
    type: 'url',
    placeholder: 'https://instagram.com/yourprofile',
    category: 'Social Media',
  },
  {
    key: 'linkedin_url',
    label: 'LinkedIn URL',
    icon: Linkedin,
    type: 'url',
    placeholder: 'https://linkedin.com/company/yourcompany',
    category: 'Social Media',
  },
  {
    key: 'youtube_url',
    label: 'YouTube URL',
    icon: Youtube,
    type: 'url',
    placeholder: 'https://youtube.com/@yourchannel',
    category: 'Social Media',
  },
  {
    key: 'tiktok_url',
    label: 'TikTok URL',
    icon: Smartphone,
    type: 'url',
    placeholder: 'https://tiktok.com/@yourprofile',
    category: 'Social Media',
  },
  {
    key: 'pinterest_url',
    label: 'Pinterest URL',
    icon: Globe,
    type: 'url',
    placeholder: 'https://pinterest.com/yourprofile',
    category: 'Social Media',
  },

  // Messaging Apps
  {
    key: 'telegram_username',
    label: 'Telegram Username',
    icon: Send,
    type: 'text',
    placeholder: '@yourcompany',
    category: 'Messaging Apps',
  },
  {
    key: 'discord_server',
    label: 'Discord Server',
    icon: MessageCircle,
    type: 'url',
    placeholder: 'https://discord.gg/yourserver',
    category: 'Messaging Apps',
  },
  {
    key: 'slack_workspace',
    label: 'Slack Workspace',
    icon: Hash,
    type: 'url',
    placeholder: 'https://yourcompany.slack.com',
    category: 'Messaging Apps',
  },

  // Business Hours
  {
    key: 'business_hours_weekday',
    label: 'Weekday Hours',
    icon: Clock,
    type: 'text',
    placeholder: 'Monday - Friday: 9:00 AM - 6:00 PM',
    category: 'Business Hours',
  },
  {
    key: 'business_hours_saturday',
    label: 'Saturday Hours',
    icon: Clock,
    type: 'text',
    placeholder: 'Saturday: 10:00 AM - 4:00 PM',
    category: 'Business Hours',
  },
  {
    key: 'business_hours_sunday',
    label: 'Sunday Hours',
    icon: Clock,
    type: 'text',
    placeholder: 'Sunday: Closed',
    category: 'Business Hours',
  },
  {
    key: 'timezone',
    label: 'Timezone',
    icon: Globe,
    type: 'text',
    placeholder: 'America/New_York',
    category: 'Business Hours',
  },

  // Additional Information
  {
    key: 'website_url',
    label: 'Website URL',
    icon: Globe,
    type: 'url',
    placeholder: 'https://yourcompany.com',
    category: 'Additional Information',
  },
  {
    key: 'support_portal_url',
    label: 'Support Portal URL',
    icon: Globe,
    type: 'url',
    placeholder: 'https://support.yourcompany.com',
    category: 'Additional Information',
  },
  {
    key: 'help_center_url',
    label: 'Help Center URL',
    icon: Globe,
    type: 'url',
    placeholder: 'https://help.yourcompany.com',
    category: 'Additional Information',
  },
  {
    key: 'company_registration',
    label: 'Company Registration Number',
    icon: FileText,
    type: 'text',
    placeholder: 'REG-123456',
    category: 'Additional Information',
  },
  {
    key: 'tax_id',
    label: 'Tax ID / EIN',
    icon: Hash,
    type: 'text',
    placeholder: '12-3456789',
    category: 'Additional Information',
  },

  // Map & Location
  {
    key: 'google_maps_url',
    label: 'Google Maps URL',
    icon: MapPin,
    type: 'url',
    placeholder: 'https://maps.google.com/?q=...',
    category: 'Map & Location',
  },
  {
    key: 'latitude',
    label: 'Latitude',
    icon: MapPin,
    type: 'text',
    placeholder: '40.7128',
    category: 'Map & Location',
  },
  {
    key: 'longitude',
    label: 'Longitude',
    icon: MapPin,
    type: 'text',
    placeholder: '-74.0060',
    category: 'Map & Location',
  },
];

// Group fields by category
export const groupedContactFields = contactFieldsConfig.reduce(
  (acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  },
  {} as Record<string, ContactField[]>
);
