import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVideoMetadata, cleanupTempFile } from '@/lib/utils/video-processor';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

/**
 * POST /api/upload/video/metadata
 * Get video metadata without uploading
 */
export async function POST(request: NextRequest) {
  let tempPath: string | null = null;

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

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer and save to temp file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    tempPath = join(tmpdir(), `check-${randomBytes(8).toString('hex')}.mp4`);
    await writeFile(tempPath, buffer);

    // Get metadata
    const metadata = await getVideoMetadata(tempPath);

    // Cleanup temp file
    cleanupTempFile(tempPath);

    return NextResponse.json({
      success: true,
      metadata: {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        size: metadata.size,
        format: metadata.format,
        bitrate: metadata.bitrate,
      },
    });
  } catch (error) {
    // Cleanup temp file on error
    if (tempPath) cleanupTempFile(tempPath);

    console.error('Video metadata error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read video metadata' },
      { status: 500 }
    );
  }
}
