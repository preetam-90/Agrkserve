import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  processVideo,
  validateVideo,
  cleanupTempFile,
} from '@/lib/utils/video-processor';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/utils/cloudinary';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import type { VideoTrimRequest } from '@/lib/types/media';

export const runtime = 'nodejs';

/**
 * POST /api/upload/video
 * Upload and process a video with optional trimming to Cloudinary
 */
export async function POST(request: NextRequest) {
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'agri-serve/equipment';
    const trimDataStr = formData.get('trim') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer and save to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    tempInputPath = join(tmpdir(), `input-${randomBytes(8).toString('hex')}.mp4`);
    await writeFile(tempInputPath, buffer);

    // Validate video
    const validation = await validateVideo(tempInputPath);

    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error,
          metadata: validation.metadata,
          requiresTrim: validation.error?.includes('exceeds') 
        },
        { status: 400 }
      );
    }

    // Parse trim data if provided
    let trimRequest: VideoTrimRequest | undefined;
    if (trimDataStr) {
      try {
        trimRequest = JSON.parse(trimDataStr);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid trim data' },
          { status: 400 }
        );
      }
    }

    // Process video (trim and compress)
    const { outputPath, metadata } = await processVideo(tempInputPath, trimRequest);
    tempOutputPath = outputPath;

    // Read processed video
    const processedBuffer = await readFile(outputPath);

    // Check final size
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (processedBuffer.length > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Processed video file too large. Try reducing video length or quality.' 
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileName = `${user.id}-${randomBytes(8).toString('hex')}.mp4`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(processedBuffer, {
      folder: folder,
      fileName: fileName,
      resourceType: 'video',
      format: 'mp4',
    });

    // Cleanup temp files
    if (tempInputPath) cleanupTempFile(tempInputPath);
    if (tempOutputPath) cleanupTempFile(tempOutputPath);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration,
        size: processedBuffer.length,
        format: 'mp4',
      },
    });
  } catch (error) {
    // Cleanup temp files on error
    if (tempInputPath) cleanupTempFile(tempInputPath);
    if (tempOutputPath) cleanupTempFile(tempOutputPath);

    console.error('Video upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload/video
 * Delete a video from Cloudinary
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ success: false, error: 'No publicId provided' }, { status: 400 });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
