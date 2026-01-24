# Quick Fix: Labour Profile Error

## Error
```
Failed to create profile: {}
```

## Solution (2 steps)

### 1. Run SQL Script
1. Go to https://app.supabase.com → Your Project → SQL Editor
2. Copy & paste: `agri-serve-web/COMPLETE_LABOUR_SETUP_FIXED.sql`
3. Click **Run**

### 2. Test
1. Go to `/provider/labour/create`
2. Fill the form (add skills, rate, city)
3. Click "Create Profile"
4. Should see: "Labour profile created successfully!" ✅

## That's it!

The script automatically:
- Cleans up old functions
- Creates tables
- Sets up security
- Grants permissions

## Still having issues?
Check browser console (F12) for detailed error messages.
