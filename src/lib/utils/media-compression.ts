/**
 * Media Compression Utilities for Chat Messages
 * - Images: Max 7MB
 * - Videos: Max 30MB, Max 30 seconds
 */

import imageCompression from 'browser-image-compression';

// Constants
export const MAX_IMAGE_SIZE_MB = 7;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

export const MAX_VIDEO_SIZE_MB = 30;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 30;

// Supported formats
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];
export const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'];

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
  file?: File;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size: number;
    type: string;
  };
}

export interface CompressionProgress {
  stage: 'validating' | 'compressing' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

/**
 * Validate and get image metadata
 */
export async function validateImage(file: File): Promise<MediaValidationResult> {
  // Check file type
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported image format. Supported: JPEG, PNG, WebP, GIF`,
    };
  }

  // Get image dimensions
  const dimensions = await getImageDimensions(file);

  return {
    valid: true,
    file,
    metadata: {
      width: dimensions.width,
      height: dimensions.height,
      size: file.size,
      type: file.type,
    },
  };
}

/**
 * Validate video file
 */
export async function validateVideo(file: File): Promise<MediaValidationResult> {
  // Check file type
  if (!SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported video format. Supported: MP4, WebM, MOV`,
    };
  }

  // Check video duration
  const metadata = await getVideoMetadata(file);

  if (metadata.duration > MAX_VIDEO_DURATION_SECONDS) {
    return {
      valid: false,
      error: `Video is too long. Maximum duration is ${MAX_VIDEO_DURATION_SECONDS} seconds`,
    };
  }

  return {
    valid: true,
    file,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      duration: metadata.duration,
      size: file.size,
      type: file.type,
    },
  };
}

/**
 * Compress image to meet size requirements
 */
export async function compressImage(
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<File> {
  onProgress?.({
    stage: 'validating',
    progress: 10,
    message: 'Validating image...',
  });

  const validation = await validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // If already under size limit, return as-is
  if (file.size <= MAX_IMAGE_SIZE_BYTES) {
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Image ready',
    });
    return file;
  }

  onProgress?.({
    stage: 'compressing',
    progress: 30,
    message: 'Compressing image...',
  });

  try {
    const options = {
      maxSizeMB: MAX_IMAGE_SIZE_MB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/avif', // Convert to AVIF
      initialQuality: 0.8,
      onProgress: (percentage: number) => {
        onProgress?.({
          stage: 'compressing',
          progress: 30 + percentage * 0.6,
          message: `Compressing... ${Math.round(percentage)}%`,
        });
      },
    };

    const compressedFile = await imageCompression(file, options);

    // Convert to AVIF using canvas as fallback/enhancement if library doesn't support it fully in all browsers
    // Note: browser-image-compression might return the original type if conversion isn't supported
    // so we force a check here.
    let finalFile = compressedFile;

    // Check if we need to manually convert to AVIF (if the library didn't do it)
    if (finalFile.type !== 'image/avif') {
      try {
        const bitmap = await createImageBitmap(finalFile);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/avif', 0.8)
          );
          if (blob) {
            finalFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.avif', {
              type: 'image/avif',
              lastModified: Date.now(),
            });
          }
        }
      } catch (e) {
        console.warn('AVIF conversion failed, falling back to compressed original', e);
      }
    }

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Image compressed successfully',
    });

    return finalFile;
  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: 'Failed to compress image',
    });
    throw new Error('Failed to compress image: ' + (error as Error).message);
  }
}

/**
 * Compress video to meet size and duration requirements
 */
export async function compressVideo(
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<File> {
  onProgress?.({
    stage: 'validating',
    progress: 10,
    message: 'Validating video...',
  });

  const validation = await validateVideo(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // If already under size limit, return as-is
  if (file.size <= MAX_VIDEO_SIZE_BYTES) {
    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Video ready',
    });
    return file;
  }

  onProgress?.({
    stage: 'compressing',
    progress: 30,
    message: 'Compressing video...',
  });

  // Note: Browser-side video compression is complex and requires FFmpeg.wasm
  // For now, we'll just validate and reject if too large
  // In production, you'd want to use a service like Cloudinary or implement FFmpeg.wasm

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error(
      `Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is ${MAX_VIDEO_SIZE_MB}MB. Please compress the video before uploading.`
    );
  }

  onProgress?.({
    stage: 'complete',
    progress: 100,
    message: 'Video ready',
  });

  return file;
}

/**
 * Get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Get video metadata (duration, dimensions)
 */
function getVideoMetadata(
  file: File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };

    video.src = url;
  });
}

/**
 * Generate video thumbnail
 */
export async function generateVideoThumbnail(file: File, timeInSeconds: number = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timeInSeconds, video.duration / 2);
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate thumbnail'));
          }
        },
        'image/jpeg',
        0.8
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };

    video.src = url;
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format duration for display (mm:ss)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
