# Contact Information Sync Debugging

## Issue

User updates contact information in admin panel but changes don't appear on contact page or footer.

## Debugging Steps

### Step 1: Verify Data is Saved in Database

Run this SQL query in Supabase SQL Editor:

```sql
-- Check all contact-related settings
SELECT key, value, category, updated_at
FROM system_settings
WHERE category = 'contact'
ORDER BY key;
```

**Expected**: Should show all 40+ contact fields with their values.

### Step 2: Test Public API Endpoint

Open browser console and run:

```javascript
// Test the public settings API
fetch('/api/settings')
  .then((r) => r.json())
  .then((data) => {
    console.log('📊 Total fields:', Object.keys(data.settings).length);
    console.log('📧 Email:', data.settings.support_email_primary);
    console.log('📞 Phone:', data.settings.support_phone_primary);
    console.log('🏠 Address Line 1:', data.settings.business_address_line1);
    console.log('🌐 All settings:', data.settings);
  });
```

**Expected**: Should return all contact fields with updated values.

### Step 3: Test Admin API Endpoint

In browser console (while logged in as admin):

```javascript
// Test the admin settings API
fetch('/api/admin/settings')
  .then((r) => r.json())
  .then((data) => {
    console.log('Admin API response:', data);
  });
```

### Step 4: Check Realtime Subscription

In browser console on contact page:

```javascript
// Check if Realtime is working
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const channel = supabase
  .channel('test_settings')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'system_settings',
      filter: 'category=eq.contact',
    },
    (payload) => {
      console.log('🔔 Realtime event received:', payload);
    }
  )
  .subscribe((status) => {
    console.log('📡 Subscription status:', status);
  });
```

### Step 5: Enable Realtime in Supabase

1. Go to Supabase Dashboard → Database → Replication
2. Find `system_settings` table
3. Enable replication for the table
4. Click "Save"

### Step 6: Check RLS Policies

Run this SQL query:

```sql
-- Check RLS policies for system_settings
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'system_settings';
```

**Expected**: Should have a policy allowing public SELECT for contact/general categories.

## Common Issues

### Issue 1: Data Not Saved

**Symptom**: SQL query shows old values
**Solution**: Check if `update_system_setting` RPC function is working

```sql
-- Test the RPC function
SELECT update_system_setting('support_email_primary', '"test@example.com"'::jsonb);

-- Verify it was saved
SELECT key, value FROM system_settings WHERE key = 'support_email_primary';
```

### Issue 2: API Returns Old Data

**Symptom**: Database has new values but API returns old
**Solution**: Cache issue - clear browser cache or wait 5 minutes

### Issue 3: Realtime Not Working

**Symptom**: No console logs when updating settings
**Solution**: Enable Realtime replication in Supabase Dashboard

### Issue 4: Wrong Field Names

**Symptom**: Some fields show default values
**Solution**: Check field name mapping in `getContactInfo()` function

## Quick Fix Script

Run this in Supabase SQL Editor to manually update a field:

```sql
-- Update a specific contact field
INSERT INTO system_settings (key, value, category)
VALUES ('support_email_primary', '"newemail@example.com"'::jsonb, 'contact')
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- Verify
SELECT key, value FROM system_settings WHERE key = 'support_email_primary';
```

## Expected Behavior

1. Admin updates field in `/admin/settings`
2. `handleSaveSettings()` calls `/api/admin/settings` (PUT) for each field
3. `update_system_setting` RPC function saves to database
4. `clearSettingsCache()` clears the 5-minute cache
5. Realtime subscription triggers on contact page
6. `useContactInfo` hook refetches data via `getContactInfo()`
7. Contact page re-renders with new data

## Next Steps

1. Run Step 1 to verify data is in database
2. Run Step 2 to verify API returns correct data
3. If Step 1 fails: RPC function issue
4. If Step 2 fails: API or cache issue
5. If both pass but page doesn't update: Realtime or React issue
