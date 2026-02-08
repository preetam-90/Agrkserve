'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let isLoading = false;
let loadPromise: Promise<FFmpeg> | null = null;

/**
 * Load and initialize FFmpeg instance
 */
export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = (async () => {
    isLoading = true;

    try {
      const ffmpeg = new FFmpeg();

      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } finally {
      isLoading = false;
      loadPromise = null;
    }
  })();

  return loadPromise;
}

/**
 * Trim and compress video using FFmpeg
 * - Trims to specified time range
 * - Compresses to H.264 MP4
 * - Resizes to max 690p while maintaining aspect ratio
 * - Preserves audio
 * - Optimizes for web delivery (5-15MB target)
 */
export async function trimVideo(
  videoFile: File,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void
): Promise<File> {
  const ffmpeg = await loadFFmpeg();

  // Set up progress handler
  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  const inputExt = videoFile.name.split('.').pop()?.toLowerCase() || 'mp4';
  const inputName = `input.${inputExt}`;
  const outputName = 'output.mp4';

  // Write input file to FFmpeg virtual filesystem
  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

  // Calculate duration
  const duration = endTime - startTime;

  // Run FFmpeg command:
  // - Trim from startTime for duration seconds
  // - Scale to max 690p height while maintaining aspect ratio
  // - Use H.264 codec with good compression
  // - Use AAC audio codec
  // - Apply compression preset for smaller file size
  await ffmpeg.exec([
    '-ss',
    startTime.toFixed(3),
    '-i',
    inputName,
    '-t',
    duration.toFixed(3),
    '-vf',
    'scale=-2:min(ih\\,690)', // Scale to max 690p, maintain aspect ratio
    '-c:v',
    'libx264', // H.264 video codec
    '-preset',
    'fast', // Encoding speed preset
    '-crf',
    '28', // Compression (lower = better quality, larger file)
    '-c:a',
    'aac', // AAC audio codec
    '-b:a',
    '128k', // Audio bitrate
    '-movflags',
    '+faststart', // Optimize for web streaming
    '-y', // Overwrite output
    outputName,
  ]);

  // Read output file
  const data = await ffmpeg.readFile(outputName);

  // Clean up
  await ffmpeg.deleteFile(inputName);
  await ffmpeg.deleteFile(outputName);

  // Convert to File
  const uint8 = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  const blob = new Blob([uint8], { type: 'video/mp4' });

  // Generate output filename
  const baseName = videoFile.name.replace(/\.[^/.]+$/, '');
  return new File([blob], `${baseName}_trimmed.mp4`, { type: 'video/mp4' });
}

/**
 * Get video duration
 * @param videoFile - Video file
 * @returns Duration in seconds
 */
export function getVideoDuration(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = URL.createObjectURL(videoFile);
  });
}
