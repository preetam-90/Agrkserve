# Image Storage Information

## Where Are Profile Pictures Stored?

Profile pictures are stored in **Supabase Storage** in the cloud, not on your local server.

### Storage Structure

```
Supabase Storage
├── avatars/                     # Profile pictures bucket
│   └── profile-pictures/        # Folder for all profile images
│       ├── {userId}-{timestamp}.jpg
│       ├── {userId}-{timestamp}.jpg
│       └── ...
│
└── equipment-images/            # Equipment photos bucket
    ├── {equipmentId}-1.jpg
    ├── {equipmentId}-2.jpg
    └── ...
```

### Storage Details

#### Avatars Bucket (Profile Pictures)
- **Location**: `supabase.co/storage/v1/object/public/avatars/profile-pictures/`
- **Access**: Public (anyone can view)
- **Size Limit**: 10MB per file
- **Allowed Formats**: JPEG, JPG, PNG, GIF, WebP
- **Auto-Compression**: Images > 1MB are automatically compressed
- **Compression Settings**:
  - Max dimensions: 800x800 pixels
  - Quality: 80%
  - Format: JPEG

#### Equipment Images Bucket
- **Location**: `supabase.co/storage/v1/object/public/equipment-images/`
- **Access**: Public (anyone can view)
- **Size Limit**: 10MB per file
- **Allowed Formats**: JPEG, JPG, PNG, GIF, WebP

## How Image Upload Works

### 1. User Selects Image
```
User clicks "Upload Photo" → Selects image from device
```

### 2. Automatic Compression (if needed)
```
If image > 1MB:
  ├── Resize to max 800x800px (maintains aspect ratio)
  ├── Convert to JPEG format
  ├── Apply 80% quality compression
  └── Result: Much smaller file size
```

### 3. Upload to Supabase
```
Compressed/Original image → Supabase Storage → Public URL generated
```

### 4. Save URL to Database
```
Public URL → Saved in user_profiles.profile_image
```

### 5. Display Image
```
Profile page → Fetches URL from database → Displays image from Supabase CDN
```

## Benefits of This Approach

✅ **Fast Loading**: Images served from Supabase's global CDN  
✅ **Automatic Compression**: No manual optimization needed  
✅ **Cost-Effective**: Only pay for storage used  
✅ **Scalable**: Can handle millions of images  
✅ **Secure**: Access controlled by storage policies  
✅ **Automatic Backups**: Supabase handles backups  
✅ **No Server Load**: Images not stored on your application server

## Accessing Images

### In Code
```typescript
// Profile picture URL example
const imageUrl = profile.profile_image;
// Output: https://your-project.supabase.co/storage/v1/object/public/avatars/profile-pictures/user-123-1234567890.jpg

// Display in HTML
<img src={imageUrl} alt="Profile" />
```

### Direct URL Format
```
https://{project-id}.supabase.co/storage/v1/object/public/avatars/profile-pictures/{filename}
```

## Storage Policies

### Who Can Do What?

**Profile Pictures:**
- ✅ **Upload**: Authenticated users (their own profile)
- ✅ **View**: Anyone (public access)
- ✅ **Update**: Authenticated users (their own profile)
- ✅ **Delete**: Authenticated users (their own profile)

**Equipment Images:**
- ✅ **Upload**: Authenticated users
- ✅ **View**: Anyone (public access)
- ✅ **Update**: Authenticated users (their own images)
- ✅ **Delete**: Authenticated users (their own images)

## Managing Storage

### View Storage in Supabase Dashboard
1. Go to your Supabase project
2. Click **Storage** in the left sidebar
3. Select **avatars** or **equipment-images** bucket
4. Browse uploaded files

### File Naming Convention
```
Profile Pictures: {userId}-{timestamp}.{extension}
Example: abc123-1674567890123.jpg

Equipment Images: {equipmentId}-{index}.{extension}
Example: eq-456-1.jpg
```

## Storage Costs

Supabase Storage pricing (as of 2026):
- **Free Tier**: 1GB storage + 2GB bandwidth
- **Pro Plan**: $0.021/GB/month storage + $0.09/GB bandwidth
- **Images are compressed**: Typical profile picture = 100-300KB

### Example Cost Calculation
```
1,000 users × 200KB average = 200MB
Monthly cost: ~$0.004 (less than 1 cent!)
```

## Troubleshooting

### Image Upload Fails
1. Check internet connection
2. Verify Supabase storage bucket exists
3. Check storage policies are set correctly
4. Ensure image format is supported

### Image Not Displaying
1. Check if URL is valid
2. Verify storage bucket is public
3. Check CORS settings in Supabase
4. Ensure image was successfully uploaded

### "Compressing image..." Stuck
- Large images may take 2-5 seconds to compress
- Check browser console for errors
- Try a smaller image

## Future Enhancements

Possible improvements:
- [ ] WebP format for smaller sizes
- [ ] Thumbnail generation
- [ ] Image cropping tool
- [ ] Multiple sizes (small, medium, large)
- [ ] Client-side image editing
- [ ] Lazy loading optimization
- [ ] Progressive image loading

## Technical Details

### Compression Algorithm
```javascript
- Canvas API for resizing
- 800x800 max dimensions (aspect ratio maintained)
- JPEG format at 80% quality
- Client-side processing (no server load)
```

### Security
- Storage policies enforce access control
- Only authenticated users can upload
- File type validation
- Size limits prevent abuse
- Public URLs are read-only

---

**Note**: All images are stored in Supabase Cloud Storage, not on your local machine or application server. This ensures fast, reliable, and scalable image delivery.
