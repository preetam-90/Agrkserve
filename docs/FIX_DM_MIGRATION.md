# Fix Missing get_or_create_conversation Function

## Problem

The error occurs because the direct messaging system migration hasn't been applied to your Supabase database.

## Solution

### Quick Fix (5 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/csmylqtojxzmdbkaexqu
   - Navigate to: **SQL Editor** → **New Query**

2. **Run the Migration**
   - Open this file: `supabase/migrations/012_direct_messaging_system.sql`
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click **Run**

3. **Verify Success**
   - You should see success messages for each step
   - Check that these tables were created:
     - `dm_conversations`
     - `dm_messages`
   - Check that these functions were created:
     - `get_or_create_conversation`
     - `get_user_conversations`
     - `mark_messages_as_read`
     - `get_unread_dm_count`

4. **Refresh Your App**
   - Refresh your browser
   - The error should be resolved

## What This Migration Does

Creates the complete direct messaging system including:

✅ **Tables:**

- `dm_conversations` - Stores conversation between two users
- `dm_messages` - Stores individual messages

✅ **Functions:**

- `get_or_create_conversation(user_1, user_2)` - Gets existing or creates new conversation
- `get_user_conversations(user_uuid)` - Gets all conversations for a user
- `mark_messages_as_read(conv_id, reader_id)` - Marks messages as read
- `get_unread_dm_count(user_uuid)` - Gets unread message count

✅ **Security:**

- Row Level Security (RLS) policies
- Proper access controls for authenticated users

✅ **Features:**

- Real-time subscriptions enabled
- Automatic last message updates
- Read status tracking
- Notification integration

## Alternative: Run All Migrations

If you want to ensure all migrations are applied, run them in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_labour_profiles.sql`
3. `supabase/migrations/003_labour_rpc_functions.sql`
4. `supabase/migrations/004_audit_logs.sql`
5. `supabase/migrations/005_payment_fields.sql`
6. `supabase/migrations/006_enable_realtime.sql`
7. `supabase/migrations/007_add_phone_mandatory.sql`
8. `supabase/migrations/008_setup_storage.sql`
9. `supabase/migrations/009_setup_video_storage.sql`
10. `supabase/migrations/010_add_equipment_video_url.sql`
11. `supabase/migrations/011_notification_system.sql`
12. `supabase/migrations/012_direct_messaging_system.sql` ⬅️ **THIS ONE**
13. `supabase/migrations/013_add_handle_new_user_trigger.sql`

## Testing After Migration

After applying the migration, test the direct messaging:

1. Go to a user profile page
2. Click "Message" or "Start Chat"
3. The conversation should be created without errors
4. You should be able to send and receive messages

## Troubleshooting

### "Function already exists" error

- This is normal if the migration was partially applied before
- The migration uses `CREATE OR REPLACE` which handles this gracefully

### "Permission denied" error

- Make sure you're logged in as the project owner/admin
- Check that you have sufficient permissions in Supabase

### Tables don't appear

- Refresh the Table Editor page
- Check the "public" schema in the dropdown

### Still getting errors after migration

- Clear your browser cache
- Restart your development server: `pnpm dev`
- Check browser console for specific error messages

## Need Help?

If you continue to have issues:

1. Check the Supabase logs: Dashboard → Logs
2. Verify your environment variables in `.env`
3. Ensure you're using the correct project reference: `csmylqtojxzmdbkaexqu`
