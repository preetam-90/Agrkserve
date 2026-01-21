'use client';

import { useState } from 'react';
import { MediaUpload } from '@/components/ui/media-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MediaFile } from '@/lib/types/media';

/**
 * Example component showing how to use the MediaUpload component
 * This can be integrated into equipment creation/editing forms
 */
export function EquipmentMediaUpload() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUploadComplete = (files: MediaFile[]) => {
    setMediaFiles(files);
    console.log('Uploaded files:', files);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Extract URLs from media files
      const imageUrls = mediaFiles
        .filter((f) => f.type === 'image')
        .map((f) => f.url);
      
      const videoUrls = mediaFiles
        .filter((f) => f.type === 'video')
        .map((f) => f.url);

      // Submit to your equipment API
      const equipmentData = {
        name: 'Tractor XYZ',
        description: 'Heavy-duty agricultural tractor',
        images: imageUrls,
        videos: videoUrls,
        // ... other fields
      };

      console.log('Submitting equipment:', equipmentData);
      // await equipmentService.create(equipmentData);
      
      alert('Equipment created successfully!');
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('Failed to create equipment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Equipment Media Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MediaUpload
          onUploadComplete={handleUploadComplete}
          maxImages={5}
          maxVideos={2}
          allowImages={true}
          allowVideos={true}
          folder="equipment"
        />

        {mediaFiles.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Uploaded Files ({mediaFiles.length})</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Images: {mediaFiles.filter((f) => f.type === 'image').length}
              </p>
              <p>
                Videos: {mediaFiles.filter((f) => f.type === 'video').length}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || mediaFiles.length === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Equipment'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Example with custom bucket and folder
 */
export function CustomMediaUpload() {
  const [files, setFiles] = useState<MediaFile[]>([]);

  return (
    <MediaUpload
      onUploadComplete={setFiles}
      maxImages={10}
      maxVideos={3}
      bucket="custom-bucket"
      folder="custom-folder"
    />
  );
}

/**
 * Example for profile pictures only
 */
export function ProfilePictureUpload() {
  const [avatar, setAvatar] = useState<MediaFile | null>(null);

  return (
    <MediaUpload
      onUploadComplete={(files) => setAvatar(files[0] || null)}
      maxImages={1}
      maxVideos={0}
      allowImages={true}
      allowVideos={false}
      bucket="avatars"
      folder="profile-pictures"
    />
  );
}

/**
 * Example for video-only uploads
 */
export function VideoOnlyUpload() {
  const [videos, setVideos] = useState<MediaFile[]>([]);

  return (
    <MediaUpload
      onUploadComplete={setVideos}
      maxImages={0}
      maxVideos={5}
      allowImages={false}
      allowVideos={true}
      folder="demo-videos"
    />
  );
}
