'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { klipyService } from '@/lib/services/klipy-service';
import type { KlipyMedia } from '@/lib/types';

interface KlipyMediaGridProps {
  items: KlipyMedia[];
  onSelect: (item: KlipyMedia) => void;
  loading?: boolean;
  className?: string;
}

export function KlipyMediaGrid({ items, onSelect, loading, className }: KlipyMediaGridProps) {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  // Filter out any null/undefined items (defensive programming)
  const validItems = items.filter((item): item is KlipyMedia => item != null);

  const handleImageLoad = (id: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleImageError = (id: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (validItems.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <div className="mb-3 text-5xl">🔍</div>
        <p className="text-sm text-gray-400">No items found</p>
        <p className="mt-1 text-xs text-gray-500">Try a different search term</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
    >
      {validItems.map((item) => {
        const isLoading = loadingImages.has(item.id);
        const optimalUrl = klipyService.getOptimalSize(item, 'preview');

        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-[#1a1a1a] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Loading spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}

            {/* Main Image */}
            <div className="relative h-full w-full">
              <Image
                src={optimalUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                unoptimized
                onLoad={() => handleImageLoad(item.id)}
                onError={() => handleImageError(item.id)}
              />
            </div>

            {/* Hover overlay with title */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <p className="line-clamp-2 text-left text-xs font-medium text-white">{item.title}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
