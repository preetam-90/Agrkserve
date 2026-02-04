# Dynamic Contact Information System

## Overview
The contact information (email, phone, address, social media links) is now centrally managed in the admin panel and automatically updated across the entire platform.

## How It Works

### 1. Central Database Storage
All contact information is stored in the `system_settings` table in Supabase:
- `support_email`
- `support_phone`
- `business_address`
- `social_links` (Facebook, Twitter, LinkedIn, Instagram)

### 2. Admin Panel Management
Admins can update contact information at:
```
http://localhost:3001/admin/settings
```

**Steps to update:**
1. Go to Settings → General tab
2. Click "Edit" button in Contact Information section
3. Modify email, phone, address, or social media links
4. Click "Save" button
5. Changes are immediately reflected across the platform

### 3. Automatic Updates Across Platform

The contact information is automatically displayed in:

#### ✅ Footer Component
- **Location**: `src/components/landing/PremiumFooter.tsx`
- **Updates**: Email, phone, address, social media links
- **Refresh**: Automatically fetches on page load

#### ✅ Contact Page
- **Location**: `src/app/contact/page.tsx`
- **Updates**: Email, phone, address (used for WhatsApp link too)
- **Refresh**: Automatically fetches on page load

#### 🔄 Future Integration Points
You can easily add dynamic contact info to:
- Header/Navigation
- About page
- Help/Support pages
- Email templates
- Any other component

## Technical Implementation

### Service Layer
**File**: `src/lib/services/settings.ts`

```typescript
import { getContactInfo } from '@/lib/services/settings';

// Fetch contact information
const contactInfo = await getContactInfo();
// Returns: { email, phone, address, social }
```

**Features:**
- **Caching**: Settings are cached for 5 minutes to reduce database calls
- **Fallback**: Returns default values if database is unavailable
- **Type-safe**: Full TypeScript support

### API Endpoints

#### Public Endpoint (No Auth Required)
```
GET /api/settings
```
Returns contact and general settings accessible to everyone.

#### Admin Endpoint (Auth Required)
```
GET /api/admin/settings
PUT /api/admin/settings
```
Full access to all settings for admins only.

### Database Schema

```sql
-- system_settings table
CREATE TABLE system_settings (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL, -- 'general', 'contact', 'maintenance', 'security'
  updated_at TIMESTAMPTZ,
  updated_by UUID
);
```

**Default Values:**
```sql
INSERT INTO system_settings (key, value, category) VALUES
  ('support_email', '"support@agriServe.com"', 'contact'),
  ('support_phone', '"+1-555-0123"', 'contact'),
  ('business_address', '"123 Farm Road, Agriculture City, AC 12345"', 'contact'),
  ('social_links', '{"facebook": "", "twitter": "", "linkedin": "", "instagram": ""}', 'contact');
```

### Security

#### Row Level Security (RLS)
- **Public Read**: Anyone can read `general` and `contact` category settings
- **Admin Only**: Only admins can update settings
- **Secure**: All other categories require admin authentication

```sql
-- Public can view contact settings
CREATE POLICY "Public can view contact settings" ON system_settings
  FOR SELECT USING (category IN ('general', 'contact'));

-- Admin can update
CREATE POLICY "Admin can update system_settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
```

## Usage Examples

### In a React Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getContactInfo } from '@/lib/services/settings';

export function MyComponent() {
  const [contact, setContact] = useState({
    email: 'loading...',
    phone: 'loading...',
    address: 'loading...',
    social: { facebook: '', twitter: '', linkedin: '', instagram: '' },
  });

  useEffect(() => {
    getContactInfo().then(setContact);
  }, []);

  return (
    <div>
      <p>Email: {contact.email}</p>
      <p>Phone: {contact.phone}</p>
      <p>Address: {contact.address}</p>
      <a href={contact.social.facebook}>Facebook</a>
    </div>
  );
}
```

### Direct API Call

```typescript
// Fetch settings
const response = await fetch('/api/settings');
const data = await response.json();
console.log(data.settings.support_email);
```

## Cache Management

### Automatic Cache Clearing
The cache is automatically cleared when:
- Admin saves settings in the admin panel
- 5 minutes have passed since last fetch

### Manual Cache Clearing
```typescript
import { clearSettingsCache } from '@/lib/services/settings';

// Clear cache manually
clearSettingsCache();
```

## Migration Guide

### Apply Database Migrations

1. **Create settings tables** (if not already done):
   ```bash
   # Apply migration 023
   ```

2. **Enable public access**:
   ```bash
   # Apply migration 024
   ```

### Update Existing Components

To add dynamic contact info to any component:

1. Import the service:
   ```typescript
   import { getContactInfo } from '@/lib/services/settings';
   ```

2. Fetch in useEffect:
   ```typescript
   useEffect(() => {
     getContactInfo().then((info) => {
       // Use info.email, info.phone, info.address, info.social
     });
   }, []);
   ```

3. Replace hardcoded values with state variables

## Benefits

### ✅ Single Source of Truth
- Update once in admin panel
- Changes reflect everywhere automatically
- No need to update multiple files

### ✅ No Code Deployment Required
- Change contact info without touching code
- Non-technical staff can update information
- Instant updates without rebuilding

### ✅ Consistent Branding
- Same contact info across all pages
- No risk of outdated information
- Professional appearance

### ✅ Performance Optimized
- Caching reduces database calls
- Fast page loads
- Minimal overhead

## Testing

### Test the System

1. **Update Settings**:
   - Go to `http://localhost:3001/admin/settings`
   - Change email to `newemail@example.com`
   - Click Save

2. **Verify Footer**:
   - Go to homepage
   - Scroll to footer
   - Confirm email shows `newemail@example.com`

3. **Verify Contact Page**:
   - Go to `/contact`
   - Confirm email shows `newemail@example.com`

4. **Test Cache**:
   - Change email again
   - Refresh page immediately
   - Should show new email (cache cleared on save)

## Troubleshooting

### Settings Not Updating

**Problem**: Changes in admin panel don't appear on frontend

**Solutions**:
1. Check if migration 024 is applied (public read access)
2. Clear browser cache
3. Check browser console for API errors
4. Verify RLS policies in Supabase

### Default Values Showing

**Problem**: Shows default values instead of database values

**Solutions**:
1. Check if settings exist in database
2. Run default insert SQL from migration 023
3. Check API endpoint `/api/settings` in browser
4. Verify Supabase connection

### Cache Not Clearing

**Problem**: Old values persist after update

**Solutions**:
1. Verify `clearSettingsCache()` is called after save
2. Wait 5 minutes for automatic cache expiry
3. Hard refresh browser (Ctrl+Shift+R)

## Future Enhancements

### Planned Features
- [ ] Real-time updates using Supabase Realtime
- [ ] Multi-language support for contact info
- [ ] Contact form integration
- [ ] Email template variables
- [ ] Audit log for setting changes
- [ ] Bulk import/export settings
- [ ] Setting versioning and rollback

### Integration Ideas
- Use in email notifications
- Display in mobile app
- Show in PDF invoices
- Include in API responses
- Add to meta tags for SEO

## Files Modified

### New Files
- `src/lib/services/settings.ts` - Settings service with caching
- `src/app/api/settings/route.ts` - Public API endpoint
- `supabase/migrations/024_public_settings_access.sql` - Public read access

### Modified Files
- `src/components/landing/PremiumFooter.tsx` - Dynamic contact info
- `src/app/contact/page.tsx` - Dynamic contact info
- `src/app/admin/settings/page.tsx` - Cache clearing on save

## Summary

The dynamic contact information system provides a centralized, admin-manageable way to update contact details across your entire platform. Changes made in the admin panel are automatically reflected in the footer, contact page, and any other component that uses the settings service.

**Key Points:**
- ✅ Update once, reflect everywhere
- ✅ No code changes needed
- ✅ Performance optimized with caching
- ✅ Secure with RLS policies
- ✅ Easy to extend to new components
