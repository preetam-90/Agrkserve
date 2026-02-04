# 🚀 KLIPY Quick Setup Guide

## Current Status

✅ **UI & Frontend**: Fully working with mock data  
⚠️ **Database**: Needs migration to save KLIPY metadata  
⚠️ **API**: Using mock data (real KLIPY API needs configuration)

## Step 1: Apply Database Migration (Required)

You have **3 options** to run the migration:

### Option A: Supabase Dashboard (Easiest)
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy and paste the contents of `KLIPY_QUICK_MIGRATION.sql`
5. Click **RUN**

### Option B: Command Line (if you have supabase CLI)
```bash
cd ~/Downloads/Agrkserve
supabase db push
```

### Option C: Direct psql
```bash
psql -U postgres -d your_database_name -f KLIPY_QUICK_MIGRATION.sql
```

## What the Migration Does

Adds two new columns to `dm_messages`:
- `klipy_slug` - Tracks which KLIPY media was sent
- `klipy_blur_preview` - Stores blur preview for fast loading

Expands `message_type` to include:
- `gif`, `meme`, `sticker`, `clip`

## Step 2: Test KLIPY Features

After running the migration:

1. **Start dev server**:
   ```bash
   bun run dev
   ```

2. **Open Messages**:
   - Navigate to any conversation
   - Click the ✨ **Sparkles button** in the input bar

3. **Test Each Tab**:
   - **GIFs Tab**: 8 animated GIFs available
   - **Memes Tab**: 6 meme images
   - **Stickers Tab**: 5 sticker images
   - **Clips Tab**: 3 short videos

4. **Try Search**:
   - Type "tractor" or "success" in the search bar
   - Results filter based on title/slug

5. **Send Media**:
   - Click any item
   - Add optional caption
   - Click Send
   - Media should appear in chat!

## Current Mock Data Available

### GIFs (8 items)
- Tractor Driving
- Thumbs Up
- Deal
- Harvest Time
- Success
- On My Way
- Celebration
- Thinking

### Memes (6 items)
- Farming Life Meme
- Harvest Season
- Success Kid
- Farmer Drake
- Tractor Meme
- Weather Meme

### Stickers (5 items)
- Check Mark
- Thumbs Up
- Star
- Heart
- Smile

### Clips (3 items)
- Success Sound
- Notification
- Farm Animals

## Troubleshooting

### "Database migration needed" error
→ Run the `KLIPY_QUICK_MIGRATION.sql` in Supabase SQL Editor

### Search not working
→ Now fixed! Search filters by title/slug (case-insensitive)

### Only 2-3 items showing
→ Fixed! Now shows 8 GIFs, 6 Memes, 5 Stickers, 3 Clips

### KLIPY API warnings in console
→ Expected! Using mock data until real API is configured

## Next Steps (Optional)

### Connect to Real KLIPY API
1. Contact KLIPY support: support@klipy.com
2. Confirm API endpoint format
3. Update `.env` if needed
4. Mock data will automatically stop once API responds

### Customize Mock Data
Edit `src/lib/services/klipy-service.ts` → `getMockTrendingData()` method

## Files Reference

- **Quick Migration**: `KLIPY_QUICK_MIGRATION.sql`
- **Full Migration**: `supabase/migrations/017_add_klipy_media_support.sql`
- **Service**: `src/lib/services/klipy-service.ts`
- **UI Component**: `src/components/messages/media-drawer.tsx`
- **Documentation**: `docs/KLIPY_INTEGRATION.md`

---

**Ready to use!** Just run the migration and start sending GIFs, Memes, Stickers, and Clips! 🎉
