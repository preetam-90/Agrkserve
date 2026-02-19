'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { VideoTrimmer } from '@/components/ui/video-trimmer';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { MediaFile, VideoMetadata } from '@/lib/types/media';

interface MediaUploadProps {
  onUploadComplete?: (files: MediaFile[]) => void;
  maxImages?: number;
  maxVideos?: number;
  allowImages?: boolean;
  allowVideos?: boolean;
  bucket?: string;
  folder?: string;
  value?: MediaFile[];
}

const MAX_VIDEO_DURATION = 15; // seconds

export function MediaUpload({
  onUploadComplete,
  maxImages = 5,
  maxVideos = 2,
  allowImages = true,
  allowVideos = true,
  bucket,
  folder = 'uploads',
  value = [],
}: MediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>(value);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
   
  const [_uploadType, setUploadType] = useState<'image' | 'video' | null>(null);
  const [showTrimmer, setShowTrimmer] = useState<boolean>(false);
  const [videoToTrim, setVideoToTrim] = useState<File | null>(null);
   
  const [_videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImages = uploadedFiles.filter((f) => f.type === 'image').length;
  const currentVideos = uploadedFiles.filter((f) => f.type === 'video').length;

  useEffect(() => {
    setUploadedFiles(value);
  }, [value]);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          if (currentImages >= maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            continue;
          }
          await uploadImage(file);
        } else if (file.type.startsWith('video/')) {
          if (currentVideos >= maxVideos) {
            toast.error(`Maximum ${maxVideos} videos allowed`);
            continue;
          }
          await handleVideoSelect(file);
        }
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
     
    [currentImages, currentVideos, maxImages, maxVideos]
  );

  const handleVideoSelect = async (file: File) => {
    try {
      setUploading(true);

      // Check video metadata
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/video/metadata', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to read video');
        return;
      }

      const metadata = data.metadata as VideoMetadata;
      setVideoMetadata(metadata);

      if (metadata.duration > MAX_VIDEO_DURATION) {
        // Show trimmer
        setVideoToTrim(file);
        setShowTrimmer(true);
      } else {
        // Upload directly
        await uploadVideo(file);
      }
    } catch (error) {
      toast.error('Failed to process video');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setUploadType('image');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      if (bucket) formData.append('bucket', bucket);
      formData.append('folder', folder);

      // Use XMLHttpRequest for real upload progress
      const uploadWithProgress = (): Promise<MediaFile> => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              setUploadProgress(Math.round(progress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                  const newFile: MediaFile = {
                    id: data.publicId,
                    type: 'image',
                    url: data.url,
                    publicUrl: data.publicUrl,
                    publicId: data.publicId,
                    metadata: data.metadata,
                  };
                  resolve(newFile);
                } else {
                  reject(new Error(data.error || 'Upload failed'));
                }
              } catch {
                reject(new Error('Invalid server response'));
              }
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
          });

          xhr.open('POST', '/api/upload/image');
          xhr.send(formData);
        });
      };

      const newFile = await uploadWithProgress();

      const updatedFiles = [...uploadedFiles, newFile];
      setUploadedFiles(updatedFiles);
      onUploadComplete?.(updatedFiles);
      toast.success('Image uploaded successfully');

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadType(null);
        setUploading(false);
      }, 500);
    } catch (error) {
      setUploadProgress(0);
      toast.error('Failed to upload image');
      console.error(error);
      setUploading(false);
    }
  };

  const uploadVideo = async (
    file: File,
    trimData?: { startTime: number; endTime: number; duration: number }
  ) => {
    try {
      setUploading(true);
      setUploadType('video');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      if (trimData) {
        formData.append('trim', JSON.stringify(trimData));
      }

      // Use XMLHttpRequest for real upload progress
      const uploadWithProgress = (): Promise<MediaFile | null> => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              setUploadProgress(Math.round(progress));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                  const newFile: MediaFile = {
                    id: data.publicId,
                    type: 'video',
                    url: data.url,
                    publicUrl: data.publicUrl,
                    publicId: data.publicId,
                    metadata: data.metadata,
                  };
                  resolve(newFile);
                } else {
                  reject(new Error(data.error || 'Upload failed'));
                }
              } catch {
                reject(new Error('Invalid server response'));
              }
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
          });

          xhr.open('POST', '/api/upload/video');
          xhr.send(formData);
        });
      };

      const newFile = await uploadWithProgress();

      if (newFile) {
        const updatedFiles = [...uploadedFiles, newFile];
        setUploadedFiles(updatedFiles);
        onUploadComplete?.(updatedFiles);
        toast.success('Video uploaded successfully');
      }

      // Reset progress after a short delay (if not showing trimmer)
      if (!showTrimmer) {
        setTimeout(() => {
          setUploadProgress(0);
          setUploadType(null);
          setUploading(false);
        }, 500);
      }
    } catch (error) {
      setUploadProgress(0);
      toast.error('Failed to upload video');
      console.error(error);
      setUploading(false);
    }
  };

  const handleTrim = async (startTime: number, endTime: number, duration: number) => {
    if (!videoToTrim) return;

    setShowTrimmer(false);
    await uploadVideo(videoToTrim, { startTime, endTime, duration });
    setVideoToTrim(null);
    setVideoMetadata(null);
  };

  const handleTrimCancel = () => {
    setShowTrimmer(false);
    setVideoToTrim(null);
    setVideoMetadata(null);
  };

  const removeFile = async (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId);
    if (!file) return;

    try {
      const updatedFiles = uploadedFiles.filter((f) => f.id !== fileId);
      setUploadedFiles(updatedFiles);
      onUploadComplete?.(updatedFiles);

      if (file.publicId) {
        const endpoint = file.type === 'image' ? '/api/upload/image' : '/api/upload/video';
        await fetch(`${endpoint}?publicId=${encodeURIComponent(file.publicId)}`, {
          method: 'DELETE',
        });
      }

      toast.success(`${file.type === 'image' ? 'Image' : 'Video'} removed`);
    } catch (error) {
      toast.error('Failed to remove file');
      console.error(error);
    }
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const acceptTypes = [];
  if (allowImages) acceptTypes.push('image/*');
  if (allowVideos) acceptTypes.push('video/*');

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={openFilePicker}
          disabled={uploading || (currentImages >= maxImages && currentVideos >= maxVideos)}
          variant="outline"
          className="gap-2"
        >
          {uploading ? (
            <>
              <CircularProgress progress={uploadProgress} size="sm" />
              <span className="ml-2">{uploadProgress}%</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Media
            </>
          )}
        </Button>

        <div className="text-sm text-gray-600">
          {allowImages && (
            <span>
              {currentImages}/{maxImages} images
            </span>
          )}
          {allowImages && allowVideos && <span className="mx-2">•</span>}
          {allowVideos && (
            <span>
              {currentVideos}/{maxVideos} videos
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 text-xs text-gray-500">
        {allowImages && <p>📸 Images: Auto-resized to max 1080px width, compressed to WebP/JPEG</p>}
        {allowVideos && <p>🎥 Videos: Max 15 seconds, auto-compressed to 690p MP4</p>}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              {}
              {file.type === 'image' ? (
                <Image
                  src={file.publicUrl || file.url}
                  alt="Upload"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="relative h-full w-full bg-gray-900">
                  <video
                    src={file.publicUrl || file.url}
                    className="h-full w-full object-cover"
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Video className="h-12 w-12 text-white" />
                  </div>
                  {file.metadata.duration && (
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {file.metadata.duration.toFixed(1)}s
                    </div>
                  )}
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>

              {/* File Type Badge */}
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {file.type === 'image' ? (
                  <ImageIcon className="h-3 w-3" />
                ) : (
                  <Video className="h-3 w-3" />
                )}
                {file.type}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Trimmer Dialog */}
      {videoToTrim && (
        <VideoTrimmer
          videoFile={videoToTrim}
          maxDuration={MAX_VIDEO_DURATION}
          onTrim={handleTrim}
          onCancel={handleTrimCancel}
          open={showTrimmer}
        />
      )}
    </div>
  );
}
