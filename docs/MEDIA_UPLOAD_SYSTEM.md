# Optimized Media Upload System

This document describes the implementation of the optimized media upload system for the AgriServe rental platform.

## Overview

The system provides automatic image and video processing with the following features:

### Image Processing
- **Auto-resize**: Images are resized to a maximum width of 1080px while maintaining aspect ratio
- **Compression**: Images are compressed to 70-80% quality
- **Format conversion**: Images are converted to WebP or JPEG for optimal web performance
- **No client-side processing needed**: All processing happens on the server
- **Storage**: Uploaded to Cloudinary for global CDN delivery

### Video Processing
- **Duration limit**: Maximum 15 seconds
- **Resolution optimization**: Videos are scaled to max 690p while maintaining aspect ratio
- **Compression**: Videos are compressed using H.264 codec with optimized settings
- **Format**: All videos are converted to MP4 (H.264) with AAC audio
- **Trimming UI**: Videos longer than 15 seconds show an interactive trimmer
- **Target size**: 5-15 MB depending on length and content
- **Storage**: Uploaded to Cloudinary for global CDN delivery

## System Architecture

```
Frontend (React)
  ├── MediaUpload Component (unified upload UI)
  ├── VideoTrimmer Component (interactive video trimming)
  └── API Calls
      ├── /api/upload/image (POST, DELETE)
      ├── /api/upload/video (POST, DELETE)
      └── /api/upload/video/metadata (POST)

Backend (Next.js API Routes)
  ├── Image Processing (sharp)
  │   ├── Resize to max 1080px width
  │   ├── Compress to 75% quality
  │   └── Convert to WebP/JPEG
  └── Video Processing (fluent-ffmpeg)
      ├── Trim to 15 seconds
      ├── Scale to 690p
      ├── Compress with H.264
      └── Optimize for streaming

Storage (Cloudinary)
  ├── Global CDN delivery
  ├── Automatic format optimization
  ├── Responsive image delivery
  └── Video streaming support
```

## Installation

### Dependencies

The following packages are required:

```bash
pnpm add sharp fluent-ffmpeg multer
pnpm add -D @types/fluent-ffmpeg @types/multer
pnpm add @radix-ui/react-slider
```

### FFmpeg Installation

The video processing requires FFmpeg to be installed on your system:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

**Fedora:**
```bash
sudo dnf install ffmpeg
```

### Cloudinary Configuration

Add Cloudinary credentials to your `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Usage

### Basic Usage

```tsx
import { MediaUpload } from '@/components/ui';

function EquipmentForm() {
  const [mediaFiles, setMediaFiles] = useState([]);

  return (
    <MediaUpload
      onUploadComplete={(files) => setMediaFiles(files)}
      maxImages={5}
      maxVideos={2}
      allowImages={true}
      allowVideos={true}
    />
  );
}
```

### Advanced Configuration

```tsx
<MediaUpload
  onUploadComplete={handleUploadComplete}
  maxImages={10}              // Max number of images
  maxVideos={3}               // Max number of videos
  allowImages={true}          // Enable image uploads
  allowVideos={true}          // Enable video uploads
  folder="agri-serve/equipment" // Cloudinary folder path
  value={existingFiles}       // Pre-populate with existing files
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onUploadComplete` | `(files: MediaFile[]) => void` | - | Callback when files are uploaded |
| `maxImages` | `number` | `5` | Maximum number of images |
| `maxVideos` | `number` | `2` | Maximum number of videos |
| `allowImages` | `boolean` | `true` | Enable image uploads |
| `allowVideos` | `boolean` | `true` | Enable video uploads |
| `folder` | `string` | `'agri-serve/equipment'` | Cloudinary folder path |
| `value` | `MediaFile[]` | `[]` | Pre-populated files |

## API Endpoints

### POST /api/upload/image

Upload and process an image to Cloudinary.

**Request:**
```typescript
FormData {
  file: File,
  folder?: string   // Default: 'agri-serve/equipment'
}
```

**Response:**
```typescript
{
  success: boolean,
  url: string,          // Cloudinary secure URL
  publicUrl: string,    // Same as url
  publicId: string,     // Cloudinary public_id for deletion
  metadata: {
    width: number,
    height: number,
    size: number,
    format: string
  }
}
```

### POST /api/upload/video

Upload and process a video with optional trimming to Cloudinary.

**Request:**
```typescript
FormData {
  file: File,
  folder?: string,  // Default: 'agri-serve/equipment'
  trim?: string     // JSON string of VideoTrimRequest
}
```

**VideoTrimRequest:**
```typescript
{
  startTime: number,  // seconds
  endTime: number,    // seconds
  duration: number    // seconds
}
```

**Response:**
```typescript
{
  success: boolean,
  url: string,          // Cloudinary secure URL
  publicUrl: string,    // Same as url
  publicId: string,     // Cloudinary public_id for deletion
  metadata: {
    width: number,
    height: number,
    duration: number,
    size: number,
    format: string
  },
  requiresTrim?: boolean  // If video exceeds 15 seconds
}
```

### POST /api/upload/video/metadata

Get video metadata without uploading.

**Request:**
```typescript
FormData {
  file: File
}
```

**Response:**
```typescript
{
  success: boolean,
  metadata: {
    duration: number,
    width: number,
    height: number,
    size: number,
    format: string,
    bitrate: number
  }
}
```

### DELETE /api/upload/image & /api/upload/video

Delete uploaded media from Cloudinary.

**Query Parameters:**
- `publicId` (required): Cloudinary public_id of the file

**Response:**
```typescript
{
  success: boolean,
  error?: string
}
```

## Components

### MediaUpload

Main upload component with drag-and-drop support, preview, and automatic processing.

**Features:**
- Multiple file upload
- Image and video support
- Automatic validation
- Preview with thumbnails
- Remove uploaded files
- Progress indication
- Error handling with toast notifications

### VideoTrimmer

Interactive video trimming component.

**Features:**
- Video preview with play/pause
- Dual sliders for start/end selection
- Real-time duration display
- Maximum duration enforcement (15 seconds)
- Visual timeline
- Responsive design

## Configuration

### Image Processing Config

```typescript
// src/lib/types/media.ts
export const DEFAULT_IMAGE_CONFIG = {
  maxWidth: 1080,
  quality: 75,      // 0-100
  format: 'webp',   // 'webp' or 'jpeg'
};
```

### Video Processing Config

```typescript
// src/lib/types/media.ts
export const DEFAULT_VIDEO_CONFIG = {
  maxDuration: 15,        // seconds
  maxResolution: 690,     // height in pixels
  format: 'mp4',
  maxFileSizeMB: 15,
  minFileSizeMB: 5,
};
```

## Utilities

### Image Processing

```typescript
import { processImage, validateImage, getImageMetadata } from '@/lib/utils/image-processor';

// Process image
const processedBuffer = await processImage(buffer, {
  maxWidth: 1080,
  quality: 75,
  format: 'webp'
});

// Validate image
const validation = validateImage(file);

// Get metadata
const metadata = await getImageMetadata(buffer);
```

### Video Processing

```typescript
import {
  processVideo,
  validateVideo,
  trimVideo,
  compressVideo,
  generateThumbnail,
  getVideoMetadata
} from '@/lib/utils/video-processor';

// Full processing (trim + compress)
const { outputPath, metadata } = await processVideo(
  inputPath,
  { startTime: 0, endTime: 15, duration: 15 },
  { maxResolution: 690 }
);

// Just trim
const trimmedPath = await trimVideo(inputPath, {
  startTime: 5,
  endTime: 20,
  duration: 15
});

// Just compress
const compressedPath = await compressVideo(inputPath, {
  maxResolution: 690
});

// Get metadata
const metadata = await getVideoMetadata(filePath);

// Generate thumbnail
const thumbnailPath = await generateThumbnail(inputPath, undefined, 1);
```

## Storage Buckets

### equipment-images
- **Purpose**: Equipment listing photos
- **File size limit**: 10MB (before processing)
- **Allowed formats**: JPEG, PNG, WebP, GIF
- **Public**: Yes

### equipment-videos
- **Purpose**: Equipment demo videos
- **File size limit**: 20MB (after processing)
- **Allowed formats**: MP4, QuickTime, AVI, WebM
- **Public**: Yes

### avatars
- **Purpose**: User profile pictures
- **File size limit**: 10MB
- **Allowed formats**: JPEG, PNG, WebP, GIF
- **Public**: Yes

## Performance Optimization

### Image Processing
- Uses Sharp (libvips) for fast image processing
- Mozjpeg for JPEG compression
- WebP format for better compression
- Streaming processing (no full file in memory)

### Video Processing
- H.264 codec with CRF 28 (constant rate factor)
- Medium preset for balance between speed and compression
- Fast start for web streaming
- Audio bitrate reduced to 128k
- Progressive encoding

### Server-Side Processing
- All heavy processing happens on the server
- Prevents large file transfers from client
- Consistent quality across all devices
- No client-side dependencies

## Error Handling

The system includes comprehensive error handling:

- File validation before upload
- Size limit checks
- Format validation
- Duration checks for videos
- Automatic retry logic
- User-friendly error messages via toast notifications
- Cleanup of temporary files

## Security

- Authentication required for all uploads
- User ID included in file paths
- Storage policies restrict access
- File type validation
- Size limit enforcement
- XSS prevention (no executable file types)

## Testing

### Test Image Upload

```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "folder=test"
```

### Test Video Upload

```bash
curl -X POST http://localhost:3001/api/upload/video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-video.mp4" \
  -F "folder=test"
```

### Test Video with Trim

```bash
curl -X POST http://localhost:3001/api/upload/video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-video.mp4" \
  -F 'trim={"startTime":0,"endTime":15,"duration":15}' \
  -F "folder=test"
```

## Troubleshooting

### FFmpeg not found

**Error:** `sh: line 1: ffmpeg: command not found`

**Solution:** Install FFmpeg on your system (see Installation section)

### Video processing timeout

**Error:** `Processing timeout`

**Solution:** Large videos may take time to process. Increase timeout in your deployment environment.

### Sharp installation issues

**Error:** `Sharp installation failed`

**Solution:** 
```bash
pnpm rebuild sharp
# or
npm rebuild sharp --platform=linux --arch=x64
```

### Permission denied errors

**Error:** `EACCES: permission denied`

**Solution:** Ensure the application has write access to the temp directory (`/tmp` or `os.tmpdir()`)

## Future Enhancements

- [ ] Client-side video trimming with ffmpeg.wasm
- [ ] Drag-and-drop file upload
- [ ] Image cropping UI
- [ ] Multiple video quality options
- [ ] Background upload with progress bars
- [ ] Resumable uploads for large files
- [ ] Batch upload optimization
- [ ] CDN integration
- [ ] Automatic thumbnail generation for videos
- [ ] Image filters and effects

## License

MIT
