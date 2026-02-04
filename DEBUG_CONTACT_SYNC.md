# Contact Information Sync - Debugging Guide

## Problem
Contact information updates in admin panel don't appear on contact page or footer.

## What I've Implemented

### 1. Real-Time Updates System
- **Hook**: `useContactInfo` - Subscribes to database changes via Supabase Realtime
- **Service**: `getContactInfo()` - Fetches contact data from API
- **API**: `/api/settings` - Public endpoint (no auth required)
- **Cache**: 5-minute cache with `clearSettingsCache()` function

### 2. Data Flow
```
Admin Panel → Save → API → Database → Realtime → Hook → React State → UI Update
```

### 3. Files Modified
- `src/lib/hooks/useContactInfo.ts` - Real-time hook with logging
- `src/lib/services/settings.ts` - Settings service with logging
- `src/app/contact/page.tsx` - Uses hook for dynamic data
- `src/components/landing/PremiumFooter.tsx` - Uses hook for dynamic data
- `src/app/admin/settings/page.tsx` - Saves settings and clears cache

## Debugging Steps

### Step 1: Check Browser Console Logs

Open the contact page (`/contact`) and check the browser console. You should see:

```
🔄 Fetching contact info...
🌐 Fetching fresh settings from API...
📊 API Response: { hasSettings: true, fieldCount: 41, ... }
✅ Settings cached successfully
📞 Contact info prepared: { email: "...", phone: "...", address: "..." }
✅ Contact info received: { email: "...", phone: "...", ... }
📡 Setting up Realtime subscription for system_settings...
📡 Realtime subscription status: SUBSCRIBED
✅ Successfully subscribed to contact settings changes
```

**If you see errors or missing logs, that's the problem area.**

### Step 2: Test the API Endpoint

Open browser console and run:

```javascript
fetch('/api/settings')
  .then(r => r.json())
  .then(data => {
    console.log('Total fields:', Object.keys(data.settings).length);
    console.log('Email:', data.settings.support_email_primary);
    console.log('Phone:', data.settings.support_phone_primary);
    console.log('Address:', data.settings.business_address_line1);
    console.log('All settings:', data.settings);
  });
```

**Expected**: Should return 40+ fields with your updated values.

### Step 3: Check Database Directly

Run this SQL query in Supabase SQL Editor:

```sql
-- Check all contact settings
SELECT key, value, category, updated_at
FROM system_settings
WHERE category = 'contact'
ORDER BY key;
```

**Expected**: Should show all your contact fields with updated values.

### Step 4: Test Realtime Subscription

1. Open contact page in one browser tab
2. Open admin settings in another tab
3. Update a contact field (e.g., email)
4. Click "Save All"
5. Check console in contact page tab

**Expected console logs:**
```
🔔 Contact settings changed: { ... }
🔄 Refetching contact info...
🌐 Fetching fresh settings from API...
✅ Contact info received: { email: "new@example.com", ... }
```

### Step 5: Enable Realtime in Supabase

If Realtime isn't working:

1. Go to Supabase Dashboard
2. Navigate to Database → Replication
3. Find `system_settings` table
4. Enable replication
5. Click "Save"

### Step 6: Clear Cache Manually

If data is cached, run in browser console:

```javascript
// Force clear cache and refetch
fetch('/api/settings')
  .then(r => r.json())
  .then(data => {
    console.log('Fresh data:', data.settings);
    location.reload(); // Reload page
  });
```

## Common Issues & Solutions

### Issue 1: "Returning cached settings"
**Symptom**: Console shows "📦 Returning cached settings"
**Cause**: 5-minute cache is active
**Solution**: 
- Wait 5 minutes, OR
- Update settings in admin panel (triggers `clearSettingsCache()`), OR
- Reload the page

### Issue 2: "Returning default settings (API failed)"
**Symptom**: Console shows "⚠️ Returning default settings"
**Cause**: API endpoint is failing
**Solution**: 
- Check `/api/settings` endpoint
- Check Supabase connection
- Check RLS policies

### Issue 3: No Realtime Events
**Symptom**: No "🔔 Contact settings changed" logs when updating
**Cause**: Realtime not enabled or subscription failed
**Solution**:
- Enable Realtime replication in Supabase Dashboard
- Check subscription status in console
- Verify `system_settings` table exists

### Issue 4: Data in Database but Not in API
**Symptom**: SQL query shows new values but API returns old
**Cause**: RPC function issue or RLS policy blocking
**Solution**:
```sql
-- Test RPC function
SELECT * FROM get_system_settings('contact');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'system_settings';
```

### Issue 5: Admin Save Not Working
**Symptom**: Clicking "Save All" doesn't update database
**Cause**: RPC function `update_system_setting` failing
**Solution**:
```sql
-- Test RPC function manually
SELECT update_system_setting('support_email_primary', '"test@example.com"'::jsonb);

-- Verify it was saved
SELECT key, value FROM system_settings WHERE key = 'support_email_primary';
```

## Manual Testing Checklist

- [ ] Open contact page and check console logs
- [ ] Verify API returns correct data (`/api/settings`)
- [ ] Check database has updated values (SQL query)
- [ ] Test Realtime subscription (update in admin, watch console)
- [ ] Verify Realtime is enabled in Supabase Dashboard
- [ ] Test cache clearing (update in admin, check contact page)
- [ ] Verify business hours display correctly
- [ ] Check footer also updates (uses same hook)

## Expected Console Output (Success)

When everything works correctly, you should see:

```
🔄 Fetching contact info...
🌐 Fetching fresh settings from API...
📊 API Response: {
  hasSettings: true,
  fieldCount: 41,
  sampleFields: {
    support_email_primary: "your@email.com",
    support_phone_primary: "+1-234-567-8900",
    business_address_line1: "Your Address"
  }
}
✅ Settings cached successfully
📞 Contact info prepared: {
  email: "your@email.com",
  phone: "+1-234-567-8900",
  address: "Your Address, City, State, ZIP, Country"
}
✅ Contact info received: { email: "your@email.com", phone: "+1-234-567-8900", ... }
📡 Setting up Realtime subscription for system_settings...
📡 Realtime subscription status: SUBSCRIBED
✅ Successfully subscribed to contact settings changes
```

## Next Steps

1. Open contact page and check console
2. Share the console logs with me
3. Run the SQL query and share results
4. Test the API endpoint and share response
5. I'll help identify the exact issue based on the logs

## Quick Fix Commands

### Force Refresh Data
```javascript
// In browser console
location.reload();
```

### Test API Directly
```javascript
// In browser console
fetch('/api/settings').then(r => r.json()).then(console.log);
```

### Check Realtime Status
```javascript
// In browser console on contact page
// Look for "📡 Realtime subscription status: SUBSCRIBED"
```

### Clear Browser Cache
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```
