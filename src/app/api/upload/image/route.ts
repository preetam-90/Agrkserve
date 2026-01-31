import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processImage, validateImage, getImageMetadata } from '@/lib/utils/image-processor';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/utils/cloudinary';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

/**
 * POST /api/upload/image
 * Upload and process an image to Cloudinary
 */
export async function POST(request: NextRequest) {
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

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate image
    const validation = validateImage({
      mimetype: file.type,
      size: buffer.length,
    });

    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    // Process image (resize, compress, convert)
    const processedBuffer = await processImage(buffer);

    // Get metadata
    const metadata = await getImageMetadata(processedBuffer);

    // Generate unique filename
    const fileExt = metadata.format === 'webp' ? 'webp' : 'jpg';
    const fileName = `${user.id}-${randomBytes(8).toString('hex')}.${fileExt}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(processedBuffer, {
      folder: folder,
      fileName: fileName,
      resourceType: 'image',
      format: fileExt,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        size: processedBuffer.length,
        format: fileExt,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/upload/image
 * Delete an image from Cloudinary
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
    console.error('Image delete error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
