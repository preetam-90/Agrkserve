// Media Upload Types

export interface ImageUploadConfig {
  maxWidth: number;
  quality: number; // 0-100
  format: 'jpeg' | 'webp';
}

export interface VideoUploadConfig {
  maxDuration: number; // in seconds
  maxResolution: number; // height in pixels
  format: 'mp4';
  maxFileSizeMB: number;
  minFileSizeMB: number;
}

export interface MediaUploadResponse {
  success: boolean;
  url?: string;
  publicUrl?: string;
  publicId?: string;
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size: number;
    format: string;
  };
}

export interface VideoTrimRequest {
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  format: string;
  bitrate: number;
}

export interface MediaFile {
  id: string;
  type: 'image' | 'video';
  url: string;
  publicUrl?: string;
  publicId?: string;
  thumbnail?: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    size: number;
    format: string;
  };
}

export const DEFAULT_IMAGE_CONFIG: ImageUploadConfig = {
  maxWidth: 1080,
  quality: 75,
  format: 'webp',
};

export const DEFAULT_VIDEO_CONFIG: VideoUploadConfig = {
  maxDuration: 15,
  maxResolution: 690,
  format: 'mp4',
  maxFileSizeMB: 15,
  minFileSizeMB: 5,
};
