import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import { createWriteStream, createReadStream, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';
import {
  DEFAULT_VIDEO_CONFIG,
  type VideoUploadConfig,
  type VideoMetadata,
  type VideoTrimRequest,
} from '@/lib/types/media';

/**
 * Get video metadata using ffprobe
 */
export async function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      const format = metadata.format;

      if (!videoStream) {
        reject(new Error('No video stream found'));
        return;
      }

      resolve({
        duration: format.duration || 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        size: format.size || 0,
        format: format.format_name || '',
        bitrate: format.bit_rate || 0,
      });
    });
  });
}

/**
 * Trim video to specified time range
 */
export async function trimVideo(
  inputPath: string,
  trimRequest: VideoTrimRequest,
  outputPath?: string
): Promise<string> {
  const output = outputPath || join(tmpdir(), `trimmed-${randomBytes(8).toString('hex')}.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(trimRequest.startTime)
      .setDuration(trimRequest.duration)
      .output(output)
      .outputOptions([
        '-c:v libx264', // H.264 codec
        '-preset fast', // Encoding speed
        '-c:a aac', // Audio codec
        '-strict experimental',
      ])
      .on('end', () => resolve(output))
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Compress video with resolution and quality settings
 */
export async function compressVideo(
  inputPath: string,
  config: Partial<VideoUploadConfig> = {},
  outputPath?: string
): Promise<string> {
  const finalConfig = { ...DEFAULT_VIDEO_CONFIG, ...config };
  const output = outputPath || join(tmpdir(), `compressed-${randomBytes(8).toString('hex')}.mp4`);

  // Get video metadata to calculate scaling
  const metadata = await getVideoMetadata(inputPath);
  
  // Calculate scaling to maintain aspect ratio
  let scale = '';
  if (metadata.height > finalConfig.maxResolution) {
    // Scale to max height, width auto-calculated
    scale = `-2:${finalConfig.maxResolution}`;
  }

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .output(output)
      .outputOptions([
        '-c:v libx264', // H.264 codec
        '-preset medium', // Balance between compression and speed
        '-crf 28', // Constant Rate Factor (18-28 is good, higher = more compression)
        '-c:a aac', // Audio codec
        '-b:a 128k', // Audio bitrate
        '-movflags +faststart', // Enable streaming
      ]);

    // Apply scaling if needed
    if (scale) {
      command.outputOptions([`-vf scale=${scale}`]);
    }

    command
      .on('end', () => resolve(output))
      .on('error', (err) => reject(err))
      .on('progress', (progress) => {
        // Optional: log progress
        if (progress.percent) {
          console.log(`Processing: ${Math.round(progress.percent)}% done`);
        }
      })
      .run();
  });
}

/**
 * Process video: trim if needed, then compress
 */
export async function processVideo(
  inputPath: string,
  trimRequest?: VideoTrimRequest,
  config: Partial<VideoUploadConfig> = {}
): Promise<{ outputPath: string; metadata: VideoMetadata }> {
  let processedPath = inputPath;
  let tempFiles: string[] = [];

  try {
    // Step 1: Trim if requested
    if (trimRequest) {
      const trimmedPath = await trimVideo(inputPath, trimRequest);
      tempFiles.push(trimmedPath);
      processedPath = trimmedPath;
    }

    // Step 2: Compress
    const compressedPath = await compressVideo(processedPath, config);
    tempFiles.push(compressedPath);

    // Get final metadata
    const metadata = await getVideoMetadata(compressedPath);

    return {
      outputPath: compressedPath,
      metadata,
    };
  } catch (error) {
    // Clean up temp files on error
    tempFiles.forEach((file) => {
      try {
        unlinkSync(file);
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    throw error;
  }
}

/**
 * Validate video file
 */
export async function validateVideo(
  filePath: string,
  config: Partial<VideoUploadConfig> = {}
): Promise<{ valid: boolean; error?: string; metadata?: VideoMetadata }> {
  const finalConfig = { ...DEFAULT_VIDEO_CONFIG, ...config };

  try {
    const metadata = await getVideoMetadata(filePath);

    // Check duration
    if (metadata.duration > finalConfig.maxDuration) {
      return {
        valid: false,
        error: `Video duration exceeds ${finalConfig.maxDuration} seconds. Please trim the video.`,
        metadata,
      };
    }

    // Check file size (max 50MB before processing)
    const maxSizeBytes = 50 * 1024 * 1024;
    if (metadata.size > maxSizeBytes) {
      return {
        valid: false,
        error: 'Video file too large. Maximum size before processing: 50MB',
        metadata,
      };
    }

    return { valid: true, metadata };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to read video metadata. File may be corrupted.',
    };
  }
}

/**
 * Generate video thumbnail
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath?: string,
  timestamp?: number
): Promise<string> {
  const output = outputPath || join(tmpdir(), `thumb-${randomBytes(8).toString('hex')}.jpg`);
  const timeInSeconds = timestamp || 1; // Default to 1 second

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: [timeInSeconds],
        filename: output,
        folder: tmpdir(),
        size: '1080x?', // Width 1080, height auto
      })
      .on('end', () => resolve(output))
      .on('error', (err) => reject(err));
  });
}

/**
 * Clean up temporary file
 */
export function cleanupTempFile(filePath: string): void {
  try {
    unlinkSync(filePath);
  } catch (error) {
    console.error('Failed to cleanup temp file:', error);
  }
}
