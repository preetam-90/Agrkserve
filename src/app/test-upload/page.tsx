'use client';

import { useState } from 'react';
import { MediaUpload } from '@/components/ui/media-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MediaFile } from '@/lib/types/media';

export default function UploadTestPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);

  const handleUploadComplete = (uploadedFiles: MediaFile[]) => {
    setFiles(uploadedFiles);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Media Upload Test</h1>
          <p className="text-gray-600">
            Test the optimized image and video upload system
          </p>
        </div>

        <div className="grid gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Media</CardTitle>
              <CardDescription>
                Upload images (max 1080px, auto-compressed) or videos (max 15 seconds, auto-compressed)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUpload
                onUploadComplete={handleUploadComplete}
                maxImages={5}
                maxVideos={2}
                allowImages={true}
                allowVideos={true}
                folder="test-uploads"
              />
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <Badge variant={file.type === 'image' ? 'default' : 'secondary'}>
                        {file.type.toUpperCase()}
                      </Badge>
                      
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.url}</p>
                        <p className="text-xs text-gray-500">
                          {file.metadata.width && `${file.metadata.width}x${file.metadata.height}`}
                          {file.metadata.duration && ` • ${file.metadata.duration.toFixed(1)}s`}
                          {file.metadata.size && ` • ${(file.metadata.size / 1024).toFixed(1)} KB`}
                        </p>
                      </div>

                      <a
                        href={file.publicUrl || file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📸 Image Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Auto-resize to max 1080px width</p>
                <p>• Compress to 70-80% quality</p>
                <p>• Convert to WebP or JPEG</p>
                <p>• Maintain aspect ratio</p>
                <p>• Server-side processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎥 Video Processing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Max duration: 15 seconds</p>
                <p>• Max resolution: 690p</p>
                <p>• Format: MP4 (H.264)</p>
                <p>• Auto-compression (5-15 MB)</p>
                <p>• Interactive trimmer UI</p>
              </CardContent>
            </Card>
          </div>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p><strong>Backend:</strong> Next.js API Routes</p>
              <p><strong>Image Processing:</strong> Sharp (libvips)</p>
              <p><strong>Video Processing:</strong> fluent-ffmpeg (FFmpeg)</p>
              <p><strong>Storage:</strong> Supabase Storage</p>
              <p><strong>Frontend:</strong> React with TypeScript</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
