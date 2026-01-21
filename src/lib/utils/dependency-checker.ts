import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check if FFmpeg is installed and available
 */
export async function checkFFmpeg(): Promise<{ available: boolean; version?: string; error?: string }> {
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    const versionMatch = stdout.match(/ffmpeg version (\S+)/);
    return {
      available: true,
      version: versionMatch ? versionMatch[1] : 'unknown',
    };
  } catch (error) {
    return {
      available: false,
      error: 'FFmpeg not found. Please install FFmpeg to enable video processing.',
    };
  }
}

/**
 * Check if Sharp is properly installed
 */
export async function checkSharp(): Promise<{ available: boolean; error?: string }> {
  try {
    // Try to import sharp
    const sharp = await import('sharp');
    if (sharp) {
      return { available: true };
    }
  } catch (error) {
    return {
      available: false,
      error: 'Sharp not found. Please install sharp: pnpm add sharp',
    };
  }
  return { available: false, error: 'Sharp not properly installed' };
}

/**
 * Get system information for debugging
 */
export async function getSystemInfo() {
  const ffmpegCheck = await checkFFmpeg();
  const sharpCheck = await checkSharp();

  return {
    ffmpeg: ffmpegCheck,
    sharp: sharpCheck,
    node: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}
