/**
 * POST /api/chat/media/upload
 *
 * Uploads a media file (image, video, or document) to Cloudinary
 * for temporary use in AI chat sessions.
 *
 * - No authentication required (supports both guest and logged-in users)
 * - Files are stored in 'agri-serve/chat-temp' folder in Cloudinary
 * - Files are intended to be deleted when the chat session ends
 *
 * Supported formats:
 *   Images:    JPEG, PNG, WebP — max 10MB
 *   Videos:    MP4, WebM       — max 50MB
 *   Documents: PDF, DOCX, TXT, CSV, XLSX — max 20MB
 *
 * @param formData.file - The file to upload (multipart/form-data)
 * @returns JSON { success, url, publicId, type, mimeType, name, size, timestamp }
 */
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

/**
 * Allowed media types with their MIME types, size limits,
 * and Cloudinary resource type mappings.
 */
const MEDIA_TYPE_CONFIG = {
  image: {
    mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as string[],
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    maxSizeLabel: '10MB',
    cloudinaryResourceType: 'image' as const,
  },
  video: {
    mimes: ['video/mp4', 'video/webm'] as string[],
    maxSizeBytes: 50 * 1024 * 1024, // 50 MB
    maxSizeLabel: '50MB',
    cloudinaryResourceType: 'video' as const,
  },
  document: {
    mimes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain', // .txt
      'text/csv', // .csv
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ] as string[],
    maxSizeBytes: 20 * 1024 * 1024, // 20 MB
    maxSizeLabel: '20MB',
    cloudinaryResourceType: 'raw' as const,
  },
} as const;

type MediaCategory = keyof typeof MEDIA_TYPE_CONFIG;

/**
 * Determines the media category ('image' | 'video' | 'document') for a given MIME type.
 * Returns null if the MIME type is not supported.
 */
function getMediaCategory(mimeType: string): MediaCategory | null {
  for (const [category, config] of Object.entries(MEDIA_TYPE_CONFIG)) {
    if (config.mimes.includes(mimeType)) {
      return category as MediaCategory;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // --- Validate file type ---
    const category = getMediaCategory(file.type);
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type "${file.type}". Supported: JPEG, PNG, WebP (images); MP4, WebM (videos); PDF, DOCX, TXT, CSV, XLSX (documents).`,
        },
        { status: 400 }
      );
    }

    const typeConfig = MEDIA_TYPE_CONFIG[category];

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- Validate file size ---
    if (buffer.length > typeConfig.maxSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size for ${category}s is ${typeConfig.maxSizeLabel}. Your file is ${(buffer.length / 1024 / 1024).toFixed(1)}MB.`,
        },
        { status: 400 }
      );
    }

    // --- Generate unique filename (preserve original extension) ---
    const originalExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const uniqueName = `chat-${randomBytes(8).toString('hex')}.${originalExt}`;

    // --- Upload to Cloudinary ---
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'agri-serve/chat-temp',
      fileName: uniqueName,
      resourceType: typeConfig.cloudinaryResourceType,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: category,
      mimeType: file.type,
      name: file.name,
      size: buffer.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[/api/chat/media/upload] Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Upload failed. Please try again.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
