import sharp from 'sharp';
import { DEFAULT_IMAGE_CONFIG, type ImageUploadConfig } from '@/lib/types/media';

interface ImageFile {
  mimetype: string;
  size: number;
}

/**
 * Process and optimize an image
 * - Resizes to max width while maintaining aspect ratio
 * - Compresses with specified quality
 * - Converts to specified format (JPEG or WebP)
 */
export async function processImage(
  buffer: Buffer,
  config: Partial<ImageUploadConfig> = {}
): Promise<Buffer> {
  const finalConfig = { ...DEFAULT_IMAGE_CONFIG, ...config };

  let pipeline = sharp(buffer);

  // Get image metadata
  const metadata = await pipeline.metadata();

  // Resize if image is wider than max width
  if (metadata.width && metadata.width > finalConfig.maxWidth) {
    pipeline = pipeline.resize(finalConfig.maxWidth, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to specified format with quality settings
  if (finalConfig.format === 'webp') {
    pipeline = pipeline.webp({ quality: finalConfig.quality });
  } else {
    pipeline = pipeline.jpeg({ quality: finalConfig.quality, mozjpeg: true });
  }

  return pipeline.toBuffer();
}

/**
 * Get image metadata
 */
export async function getImageMetadata(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: buffer.length,
  };
}

/**
 * Validate image file
 */
export function validateImage(file: ImageFile): { valid: boolean; error?: string } {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid image format. Allowed formats: ${allowedMimeTypes.join(', ')}`,
    };
  }

  // Max 10MB before processing
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file too large. Maximum size: 10MB',
    };
  }

  return { valid: true };
}
