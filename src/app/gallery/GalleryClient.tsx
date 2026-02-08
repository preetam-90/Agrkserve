'use client';

/* eslint-disable */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, ExternalLink, Calendar, HardDrive } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import type { Metadata } from 'next';

// Gallery/ImageGallery JSON-LD for SEO
const galleryJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'AgriServe Media Gallery',
  description:
    'Browse our collection of agricultural equipment and farm machinery images. See tractors, harvesters, and farming equipment available for rent on AgriServe India.',
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app'}/gallery`,
  inLanguage: 'en-IN',
  author: {
    '@type': 'Organization',
    name: 'AgriServe',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app',
  },
  about: {
    '@type': 'Thing',
    name: 'Agricultural Equipment',
    description:
      'Farm machinery and equipment available for rental including tractors, harvesters, and agricultural tools',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Farmers and Agricultural Businesses',
    geographicArea: {
      '@type': 'Place',
      name: 'India',
    },
  },
  hasMap: process.env.NEXT_PUBLIC_SITE_URL || 'https://agrirental.vercel.app',
};

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
    eTag: string;
  };
}

export default function PublicGalleryPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  const SUPABASE_URL = 'https://csmylqtojxzmdbkaexqu.supabase.co';

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/storage/files?bucket=media&path=');
      const result = await response.json();

      if (!result.error && result.files) {
        // Filter only actual files (not folders)
        const files = result.files.filter((f: any) => f.metadata);
        setMediaFiles(files);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
    }
    setLoading(false);
  };

  const getPublicUrl = (fileName: string) => {
    return `${SUPABASE_URL}/storage/v1/object/public/media/${fileName}`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isImage = (mimetype: string) => mimetype?.startsWith('image/');
  const isVideo = (mimetype: string) => mimetype?.startsWith('video/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(galleryJsonLd) }}
      />
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton variant="minimal" />
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-slate-900 dark:text-white">Media Gallery</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Browse and download public media files
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Files
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {mediaFiles.length}
                </p>
              </div>
              <HardDrive className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Images</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {mediaFiles.filter((f) => isImage(f.metadata?.mimetype)).length}
                </p>
              </div>
              <Image
                src="/placeholder.svg"
                alt="Images"
                width={40}
                height={40}
                className="h-10 w-10 text-green-500"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Size</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                  {formatSize(mediaFiles.reduce((sum, f) => sum + (f.metadata?.size || 0), 0))}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-12 shadow-lg dark:bg-slate-800">
            <HardDrive className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
            <p className="text-xl font-medium text-slate-500 dark:text-slate-400">
              No media files available yet
            </p>
            <p className="mt-2 text-slate-400 dark:text-slate-500">Check back later for updates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl dark:bg-slate-800"
              >
                {/* Media Preview */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {isImage(file.metadata?.mimetype) ? (
                    <img
                      src={getPublicUrl(file.name)}
                      alt={file.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : isVideo(file.metadata?.mimetype) ? (
                    <video
                      src={getPublicUrl(file.name)}
                      className="h-full w-full object-cover"
                      controls
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <HardDrive className="h-12 w-12 text-slate-400" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <a
                      href={getPublicUrl(file.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-white p-3 text-slate-900 transition-transform hover:scale-110"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                    <a
                      href={getPublicUrl(file.name)}
                      download
                      className="rounded-full bg-white p-3 text-slate-900 transition-transform hover:scale-110"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </div>
                </div>

                {/* File Info */}
                <div className="p-4">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {file.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatSize(file.metadata?.size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{file.metadata?.mimetype}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
