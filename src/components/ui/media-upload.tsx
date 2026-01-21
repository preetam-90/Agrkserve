'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VideoTrimmer } from '@/components/ui/video-trimmer';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
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
  const [showTrimmer, setShowTrimmer] = useState<boolean>(false);
  const [videoToTrim, setVideoToTrim] = useState<File | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
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

      const formData = new FormData();
      formData.append('file', file);
      if (bucket) formData.append('bucket', bucket);
      formData.append('folder', folder);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.error || 'Failed to upload image');
        return;
      }

      const newFile: MediaFile = {
        id: data.publicId,
        type: 'image',
        url: data.url,
        publicUrl: data.publicUrl,
        publicId: data.publicId,
        metadata: data.metadata,
      };

      const updatedFiles = [...uploadedFiles, newFile];
      setUploadedFiles(updatedFiles);
      onUploadComplete?.(updatedFiles);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const uploadVideo = async (file: File, trimData?: { startTime: number; endTime: number; duration: number }) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      if (trimData) {
        formData.append('trim', JSON.stringify(trimData));
      }

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        if (data.requiresTrim) {
          // Show trimmer
          setVideoToTrim(file);
          setVideoMetadata(data.metadata);
          setShowTrimmer(true);
          return;
        }
        toast.error(data.error || 'Failed to upload video');
        return;
      }

      const newFile: MediaFile = {
        id: data.publicId,
        type: 'video',
        url: data.url,
        publicUrl: data.publicUrl,
        publicId: data.publicId,
        metadata: data.metadata,
      };

      const updatedFiles = [...uploadedFiles, newFile];
      setUploadedFiles(updatedFiles);
      onUploadComplete?.(updatedFiles);
      toast.success('Video uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload video');
      console.error(error);
    } finally {
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
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Media
            </>
          )}
        </Button>

        <div className="text-sm text-gray-600">
          {allowImages && <span>{currentImages}/{maxImages} images</span>}
          {allowImages && allowVideos && <span className="mx-2">•</span>}
          {allowVideos && <span>{currentVideos}/{maxVideos} videos</span>}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 space-y-1">
        {allowImages && (
          <p>📸 Images: Auto-resized to max 1080px width, compressed to WebP/JPEG</p>
        )}
        {allowVideos && (
          <p>🎥 Videos: Max 15 seconds, auto-compressed to 690p MP4</p>
        )}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="relative group aspect-square rounded-lg overflow-hidden border">
              {file.type === 'image' ? (
                <img
                  src={file.publicUrl || file.url}
                  alt="Upload"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full bg-gray-900">
                  <video
                    src={file.publicUrl || file.url}
                    className="w-full h-full object-cover"
                    controls={false}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Video className="h-12 w-12 text-white" />
                  </div>
                  {file.metadata.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {file.metadata.duration.toFixed(1)}s
                    </div>
                  )}
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>

              {/* File Type Badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
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
