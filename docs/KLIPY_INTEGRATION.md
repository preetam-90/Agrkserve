# KLIPY Media Integration

This document describes the implementation of KLIPY media features (GIFs, Memes, Stickers, and Clips) in the AgriServe messaging system.

## Overview

KLIPY is integrated into the direct messaging system to allow users to send rich media content optimized for agricultural themes. The implementation includes:

- ✨ Media Drawer with 4 tabs: GIFs, Memes, Stickers, and Clips
- 🔍 Search & autocomplete with agricultural keyword suggestions
- 🎨 Blur preview for instant display on low connectivity
- 📊 Share tracking for trending content
- 💾 Local caching for recent items (personalization)
- 🎯 Optimized image/video delivery (multiple resolutions)

## Features

### 1. Media Types

| Type         | Description          | Use Case                                    |
| ------------ | -------------------- | ------------------------------------------- |
| **GIFs**     | Animated reactions   | Quick responses like "Deal!" or "On my way" |
| **Memes**    | Humorous images      | Community building and farming humor        |
| **Stickers** | Transparent overlays | Status updates and reactions                |
| **Clips**    | Short video/audio    | Farm sounds, celebrations, notifications    |

### 2. Search & Discovery

- **Search Bar**: Type to search KLIPY's database (e.g., "tractor", "harvest")
- **Autocomplete**: Real-time suggestions as you type
- **Categories**: Browse by predefined categories
- **Trending**: See what's popular
- **Recent**: Quick access to your frequently used items

### 3. Agricultural Keywords

Default suggestions include:

- Tractors, Harvest, Plowing
- Success, Weather, Deal
- Farming, Crop, Rural life
- And many more...

### 4. Performance Optimizations

#### Blur Preview

All KLIPY media includes a Base64-encoded blur preview that displays instantly while the high-res image loads. Perfect for rural areas with slow internet.

#### Resolution Selection

- **Preview (xs/sm)**: Shown in chat feed to save bandwidth
- **Full View (md/hd)**: Loaded only when user taps to view

#### Local Caching

Recent items are stored in localStorage, allowing instant access to favorite reactions without API calls.

## Implementation Details

### File Structure

```
src/
├── lib/
│   ├── types/
│   │   └── klipy.ts                    # KLIPY type definitions
│   ├── services/
│   │   └── klipy-service.ts            # KLIPY API client
│   └── store/
│       └── messages-store.ts           # Updated with KLIPY support
├── components/
│   └── messages/
│       ├── media-drawer.tsx            # Main KLIPY media picker
│       ├── klipy-media-grid.tsx        # Grid display component
│       └── chat-window.tsx             # Updated with KLIPY integration
└── supabase/
    └── migrations/
        └── 017_add_klipy_media_support.sql  # Database schema update
```

### Database Schema

The `dm_messages` table has been extended with:

```sql
-- New message types
message_type: 'text' | 'image' | 'video' | 'gif' | 'meme' | 'sticker' | 'clip'

-- KLIPY metadata
klipy_slug: TEXT           -- For tracking and analytics
klipy_blur_preview: TEXT   -- Base64 blur preview
```

### API Integration

#### Environment Variables

```env
NEXT_PUBLIC_KLIPY_API_KEY=your_api_key_here
NEXT_PUBLIC_KLIPY_BASE_URL=https://api.klipy.com/api/v1
```

#### Key Endpoints Used

1. **Search**: `GET /api/v1/{app_key}/search`
2. **Categories**: `GET /api/v1/{app_key}/{type}/categories`
3. **Trending**: `GET /api/v1/{app_key}/{type}/trending`
4. **Autocomplete**: `GET /api/v1/{app_key}/autocomplete`
5. **Recent**: `GET /api/v1/{app_key}/{type}/recent/{customer_id}`
6. **Share Tracking**: `POST /api/v1/{app_key}/share/{slug}`

### Usage

#### Opening the Media Drawer

Click the ✨ (Sparkles) icon in the message input bar to open the KLIPY Media Drawer.

#### Sending KLIPY Media

1. Select a tab (GIF, Meme, Sticker, or Clip)
2. Browse trending items or search for specific content
3. Click on an item to select it
4. Optionally add a caption
5. Press Send

#### Message Flow

```typescript
// 1. User selects KLIPY media
handleKlipyMediaSelect(media: KlipyMedia)

// 2. Send to backend
sendKlipyMediaMessage({
  slug: media.slug,
  type: media.type,
  media_url: media.media_url,
  blur_preview: media.blur_preview,
  // ... other metadata
}, caption?)

// 3. Track share with KLIPY API
klipyService.share({
  slug: media.slug,
  customer_id: user.id,
})

// 4. Store in Supabase
INSERT INTO dm_messages (
  message_type,
  media_url,
  klipy_slug,
  klipy_blur_preview,
  // ... other fields
)

// 5. Render in chat
// Different rendering based on type
// - GIFs: Animated with blur preview
// - Memes: Image with blur preview
// - Stickers: Transparent background
// - Clips: Video player with controls
```

## Key Components

### 1. MediaDrawer Component

The main KLIPY interface with:

- Tab navigation (GIF, Meme, Sticker, Clip)
- Search bar with autocomplete
- View mode toggles (Trending, Recent)
- Agricultural keyword suggestions
- Grid display of media items

### 2. KlipyMediaGrid Component

Displays media in a responsive grid with:

- Blur preview for instant display
- Lazy loading of high-res images
- Hover effects and metadata
- Play icons for clips
- Type badges

### 3. KLIPY Service

Handles all API interactions:

- Search and filtering
- Category browsing
- Trending items
- Autocomplete suggestions
- Recent items (API + localStorage)
- Share tracking
- Optimal size selection

### 4. Message Rendering

Different rendering logic for each type:

- **GIFs**: Auto-play with blur preview
- **Memes**: Static image with blur preview
- **Stickers**: Transparent background, smaller size
- **Clips**: Video player with controls and duration

## Best Practices

### 1. Bandwidth Optimization

- Always show blur preview first
- Use small/xs sizes for chat feed
- Load HD only on full view

### 2. User Experience

- Cache recent items locally
- Provide agricultural keywords
- Show trending content by default

### 3. API Usage

- Always call share endpoint when sending
- Track customer_id for personalization
- Respect rate limits

### 4. Error Handling

- Fallback to local cache if API fails
- Show empty state with suggestions
- Graceful degradation

## Migration Guide

To apply the database changes:

```bash
# Run the migration
npx supabase migration up

# Or if using direct SQL
psql -U postgres -d your_database -f supabase/migrations/017_add_klipy_media_support.sql
```

## Testing

### Manual Testing Checklist

- [ ] Open Media Drawer with ✨ button
- [ ] Switch between tabs (GIF, Meme, Sticker, Clip)
- [ ] Search for "tractor" and verify results
- [ ] Test autocomplete by typing "harv..."
- [ ] Click trending items
- [ ] Send a GIF with caption
- [ ] Verify blur preview displays first
- [ ] Check message rendering for all 4 types
- [ ] Verify stickers have transparent background
- [ ] Test clip video playback
- [ ] Check recent items appear after sending
- [ ] Test on slow connection (blur preview)

## Analytics

A view `dm_klipy_media_stats` is available for tracking:

- Total media sent per type
- Unique senders
- Unique conversations
- 30-day rolling window

```sql
SELECT * FROM dm_klipy_media_stats;
```

## Troubleshooting

### Media Not Loading

1. Check API key in `.env`
2. Verify network connectivity
3. Check browser console for errors
4. Try fallback to recent items

### Blur Preview Not Showing

1. Verify `klipy_blur_preview` is stored in DB
2. Check Base64 encoding is valid
3. Ensure `data:image/jpeg;base64,` prefix

### Share Tracking Failing

- Not critical, logs warning only
- Doesn't block message sending
- Check KLIPY API status

## Future Enhancements

- [ ] Favorites/starred items
- [ ] Custom categories for agriculture
- [ ] Batch sending multiple items
- [ ] GIF creation from uploaded videos
- [ ] Sticker customization
- [ ] Analytics dashboard

## Support

For KLIPY API issues, contact: support@klipy.com
For implementation questions, see the code comments in:

- `src/lib/services/klipy-service.ts`
- `src/components/messages/media-drawer.tsx`
