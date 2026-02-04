# 📞 Comprehensive Contact Information System

## Overview
Your admin panel now supports **40+ contact information fields** that can be managed from one place and automatically updated across your entire platform!

## 🎯 What's Included

### Primary Contact (9 fields)
- ✅ Primary Support Email
- ✅ Secondary Support Email  
- ✅ Sales Email
- ✅ Primary Phone
- ✅ Secondary Phone
- ✅ WhatsApp Number
- ✅ Toll-Free Number
- ✅ Fax Number
- ✅ Emergency Contact

### Business Address (6 fields)
- ✅ Address Line 1
- ✅ Address Line 2
- ✅ City
- ✅ State/Province
- ✅ Postal Code
- ✅ Country

### Social Media (7 platforms)
- ✅ Facebook
- ✅ Twitter/X
- ✅ Instagram
- ✅ LinkedIn
- ✅ YouTube
- ✅ TikTok
- ✅ Pinterest

### Messaging Apps (3 platforms)
- ✅ Telegram
- ✅ Discord
- ✅ Slack

### Business Hours (4 fields)
- ✅ Weekday Hours
- ✅ Saturday Hours
- ✅ Sunday Hours
- ✅ Timezone

### Additional Information (5 fields)
- ✅ Website URL
- ✅ Support Portal URL
- ✅ Help Center URL
- ✅ Company Registration Number
- ✅ Tax ID / EIN

### Map & Location (3 fields)
- ✅ Google Maps URL
- ✅ Latitude
- ✅ Longitude

## 🚀 Setup Instructions

### Step 1: Run the Updated SQL

The `SETUP_ADMIN_SETTINGS.sql` file now includes all extended contact fields.

1. Open `SETUP_ADMIN_SETTINGS.sql`
2. Copy the ENTIRE file
3. Go to Supabase Dashboard → SQL Editor
4. Paste and click **Run**

This will create:
- All 40+ contact fields with default values
- Proper categorization
- Public read access for contact info

### Step 2: Restart Your Dev Server

```bash
npm run dev
```

### Step 3: Access Admin Settings

Go to: `http://localhost:3001/admin/settings`

## 📝 How to Use

### Update Contact Information

1. **Navigate** to Admin Settings → General tab
2. **Click** "Edit" button
3. **Fill in** any contact fields you want
4. **Click** "Save All"
5. **Done!** Changes are live everywhere

### Where It Appears

Your contact information automatically appears in:
- ✅ Footer (all pages)
- ✅ Contact page
- ✅ Any component using `getContactInfo()`

## 💻 For Developers

### Access Contact Info in Components

```typescript
import { getContactInfo } from '@/lib/services/settings';

// In your component
const contactInfo = await getContactInfo();

// Available fields:
contactInfo.email              // Primary email
contactInfo.emailSecondary     // Secondary email
contactInfo.salesEmail         // Sales email
contactInfo.phone              // Primary phone
contactInfo.phoneSecondary     // Secondary phone
contactInfo.whatsapp           // WhatsApp number
contactInfo.tollFree           // Toll-free number
contactInfo.fax                // Fax number
contactInfo.emergency          // Emergency contact

// Address (full string)
contactInfo.address            // "123 Main St, Suite 100, New York, NY, 10001, USA"

// Address (components)
contactInfo.addressLine1
contactInfo.addressLine2
contactInfo.city
contactInfo.state
contactInfo.country
contactInfo.postalCode

// Social Media
contactInfo.social.facebook
contactInfo.social.twitter
contactInfo.social.instagram
contactInfo.social.linkedin
contactInfo.social.youtube
contactInfo.social.tiktok
contactInfo.social.pinterest

// Messaging
contactInfo.messaging.telegram
contactInfo.messaging.discord
contactInfo.messaging.slack

// Business Hours
contactInfo.hours.weekday
contactInfo.hours.saturday
contactInfo.hours.sunday
contactInfo.hours.timezone

// Additional
contactInfo.website
contactInfo.supportPortal
contactInfo.helpCenter
contactInfo.companyRegistration
contactInfo.taxId

// Location
contactInfo.googleMaps
contactInfo.latitude
contactInfo.longitude
```

### Update a Specific Field

```typescript
// In admin panel
await fetch('/api/admin/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'support_email_primary',
    value: 'newsupport@company.com'
  })
});

// Clear cache so changes appear immediately
import { clearSettingsCache } from '@/lib/services/settings';
clearSettingsCache();
```

## 🎨 Admin Panel Features

### Organized by Category

Fields are grouped for easy management:
1. **Primary Contact** - Emails, phones, WhatsApp
2. **Business Address** - Full address components
3. **Social Media** - All social platforms
4. **Messaging Apps** - Telegram, Discord, Slack
5. **Business Hours** - Operating hours
6. **Additional Information** - Website, portals, legal info
7. **Map & Location** - Google Maps, coordinates

### Smart Features

- **Required Fields** - Marked with red asterisk (*)
- **Field Validation** - Email, phone, URL types validated
- **Bulk Save** - Save all changes at once
- **Edit Mode** - Toggle edit mode to prevent accidental changes
- **Visual Icons** - Each field has a relevant icon
- **Placeholders** - Helpful examples for each field

## 🔄 Backward Compatibility

The system maintains backward compatibility with old format:

```typescript
// Old format still works
settings.support_email  // Maps to support_email_primary
settings.support_phone  // Maps to support_phone_primary
settings.business_address  // Built from address components
settings.social_links.facebook  // Maps to facebook_url
```

## 📊 Database Structure

All fields stored in `system_settings` table:

```sql
SELECT key, value FROM system_settings WHERE category = 'contact';
```

Returns 40+ rows with all contact information.

## 🎯 Use Cases

### E-commerce
- Multiple support emails for different departments
- WhatsApp for quick customer service
- Social media for marketing
- Business hours for customer expectations

### SaaS Platform
- Sales email for leads
- Support portal for tickets
- Help center for documentation
- Multiple phone numbers for different regions

### Service Business
- Emergency contact for urgent issues
- Google Maps for location
- Business hours for scheduling
- Social media for engagement

## 🔒 Security

- ✅ Public can READ contact info (footer, contact page)
- ✅ Only admins can UPDATE contact info
- ✅ All changes logged with timestamp and user
- ✅ RLS policies enforce access control

## 📱 Responsive Design

The admin panel contact form is fully responsive:
- **Mobile**: Single column layout
- **Tablet**: 2-column grid
- **Desktop**: 2-column grid with better spacing

## ✨ Future Enhancements

Potential additions:
- [ ] Multi-language support for contact info
- [ ] Contact form builder
- [ ] Email template variables
- [ ] SMS integration
- [ ] Live chat widget configuration
- [ ] Opening hours calendar picker
- [ ] Map preview in admin panel
- [ ] Contact info versioning/history

## 🐛 Troubleshooting

### Fields Not Showing
- Run the SQL setup file completely
- Check browser console for errors
- Verify you're logged in as admin

### Changes Not Saving
- Check network tab for API errors
- Verify admin permissions
- Check Supabase logs

### Old Values Showing
- Clear browser cache
- Wait 5 minutes for cache to expire
- Call `clearSettingsCache()` manually

## 📚 Files Modified

### New Files
- `src/app/admin/settings/ContactFieldsConfig.tsx` - Field definitions
- `supabase/migrations/025_extended_contact_info.sql` - Extended fields
- `COMPREHENSIVE_CONTACT_SYSTEM.md` - This documentation

### Updated Files
- `src/lib/services/settings.ts` - Extended types and getters
- `src/app/admin/settings/GeneralTab.tsx` - Comprehensive form
- `SETUP_ADMIN_SETTINGS.sql` - Includes extended fields

## 🎉 Summary

You now have a **professional-grade contact management system** with:
- 40+ editable fields
- Organized categories
- Auto-sync across platform
- Type-safe TypeScript
- Secure RLS policies
- Beautiful admin UI
- Backward compatible

Update once in admin panel → Reflects everywhere instantly! 🚀
