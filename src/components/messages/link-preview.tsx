'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkPreviewProps {
  url: string;
  preview?: { title: string; description: string; image: string; url: string } | null;
  isLoading?: boolean;
}

export function LinkPreview({ url, preview, isLoading }: LinkPreviewProps) {
  if (isLoading) {
    return (
      <div className="mt-2 rounded-xl border border-[#333333] bg-[#1a1a1a] p-3">
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 animate-pulse rounded-lg bg-[#2a2a2a]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#2a2a2a]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#2a2a2a]" />
          </div>
        </div>
      </div>
    );
  }

  if (!preview) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-2 block overflow-hidden rounded-xl border border-[#333333] bg-[#1a1a1a] transition-all hover:border-blue-500/50 hover:bg-[#1f1f1f]"
    >
      <div className="flex">
        {preview.image && (
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden">
            <img
              src={preview.image}
              alt={preview.title}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-center p-3">
          <h4 className="line-clamp-1 text-sm font-medium text-white group-hover:text-blue-400">
            {preview.title || 'Untitled'}
          </h4>
          {preview.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{preview.description}</p>
          )}
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-600">
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{new URL(url).hostname}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

// Utility to extract URLs from text
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  return text.match(urlRegex) || [];
}

// Simple link metadata fetcher (in production, use a backend service)
export async function fetchLinkMetadata(url: string): Promise<{
  title: string;
  description: string;
  image: string;
  url: string;
} | null> {
  try {
    // For security, this should be done server-side
    // This is a simplified client-side version
    const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
