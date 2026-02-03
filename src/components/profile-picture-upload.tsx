'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button, CircularProgressOverlay } from '@/components/ui';
import Image from 'next/image';

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  onUpload: (imageUrl: string) => void;
  userId: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfilePictureUpload({
  currentImage,
  onUpload,
  userId,
  size = 'md',
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Maximum dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to blob with quality compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.8 // 80% quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Compress image if larger than 1MB
      let processedFile = file;
      if (file.size > 1024 * 1024) {
        setError('Compressing image...');
        processedFile = await compressImage(file);
        setError('');
      }

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(processedFile);

      // Upload file
      await handleUpload(processedFile);
    } catch {
      console.error('Image processing error');
      setError('Failed to process image. Please try again.');
      setIsUploading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('bucket', 'avatars');
      formData.append('folder', 'profile-pictures');

      // Use XMLHttpRequest for real progress tracking
      const uploadWithProgress = (): Promise<string> => {
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
                  resolve(data.url);
                } else {
                  reject(new Error(data.error || 'Upload failed'));
                }
              } catch (parseError) {
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

          xhr.open('POST', '/api/upload/profile');
          xhr.send(formData);
        });
      };

      const imageUrl = await uploadWithProgress();

      if (imageUrl) {
        onUpload(imageUrl);
      }

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch {
      console.error('Upload error');
      setUploadProgress(0);
      setError('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden rounded-full border-4 border-slate-700 bg-slate-800`}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Profile"
              width={200}
              height={200}
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-1/3 w-1/3 text-slate-500" />
          )}
        </div>

        {isUploading && (
          <CircularProgressOverlay
            progress={uploadProgress}
            size="lg"
            label={uploadProgress < 100 ? 'Uploading...' : 'Complete!'}
          />
        )}

        {preview && !isUploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-0 top-0 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="border-slate-600 bg-slate-800/50 text-slate-300 transition-all duration-300 hover:bg-slate-700 hover:text-white"
        >
          <Upload className="mr-2 h-4 w-4" />
          {preview ? 'Change Photo' : 'Upload Photo'}
        </Button>

        {error && (
          <p
            className={`text-center text-sm ${error.includes('Compressing') ? 'text-blue-400' : 'text-red-400'}`}
          >
            {error}
          </p>
        )}

        <p className="text-center text-xs text-slate-500">Any image format • Auto-compressed</p>
      </div>
    </div>
  );
}
