'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Film,
  Trash2,
  Edit3,
  Eye,
  Check,
  HardDrive,
  FileText,
} from 'lucide-react';
import type { AdminPermissions } from '@/lib/types/cloudinary-admin';
import type { CloudinaryAssetWithUser } from '@/lib/types/cloudinary-admin';

interface MediaGridProps {
  assets: CloudinaryAssetWithUser[];
  selectedAssets: Set<string>;
  onSelectAsset: (publicId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onPreview: (asset: CloudinaryAssetWithUser) => void;
  onDelete: (asset: CloudinaryAssetWithUser) => void;
  onRename: (asset: CloudinaryAssetWithUser) => void;
  isLoading?: boolean;
  onViewAudit?: (asset: CloudinaryAssetWithUser) => void;
  permissions?: AdminPermissions | null;
}

export function MediaGrid({
  assets,
  selectedAssets,
  onSelectAsset,
  onSelectAll,
  onPreview,
  onDelete,
  onRename,
  isLoading,
  onViewAudit,
  permissions,
}: MediaGridProps) {
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const allSelected = assets.length > 0 && assets.every((a) => selectedAssets.has(a.public_id));
  const someSelected = assets.some((a) => selectedAssets.has(a.public_id)) && !allSelected;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-[#1a1a1a]" />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#262626] bg-[#0f0f0f] py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1a1a]">
          <ImageIcon className="h-8 w-8 text-neutral-500" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-white">No assets found</h3>
        <p className="mt-1 text-sm text-neutral-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectAll(!allSelected)}
          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
            allSelected
              ? 'border-emerald-500 bg-emerald-500'
              : someSelected
                ? 'border-emerald-500 bg-emerald-500/50'
                : 'border-[#262626] bg-[#1a1a1a] hover:border-neutral-500'
          }`}
        >
          {(allSelected || someSelected) && <Check className="h-3.5 w-3.5 text-white" />}
        </button>
        <span className="text-sm text-neutral-400">
          {selectedAssets.size > 0 ? `${selectedAssets.size} selected` : 'Select all'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {assets.map((asset) => {
          const isSelected = selectedAssets.has(asset.public_id);
          const isHovered = hoveredAsset === asset.public_id;
          const isVideo = asset.resource_type === 'video';

          return (
            <motion.div
              key={asset.asset_id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative aspect-square overflow-hidden rounded-xl border transition-all ${
                isSelected
                  ? 'border-emerald-500 ring-1 ring-emerald-500'
                  : 'border-[#262626] hover:border-neutral-600'
              }`}
              onMouseEnter={() => setHoveredAsset(asset.public_id)}
              onMouseLeave={() => setHoveredAsset(null)}
            >
              {/* Thumbnail */}
              <div
                className="relative h-full w-full cursor-pointer bg-[#0a0a0a]"
                onClick={() => onPreview(asset)}
              >
                {asset.thumbnail_url ? (
                  <Image
                    src={asset.thumbnail_url}
                    alt={asset.public_id}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {isVideo ? (
                      <Film className="h-12 w-12 text-neutral-600" />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-neutral-600" />
                    )}
                  </div>
                )}

                {/* Video Indicator */}
                {isVideo && (
                  <div className="absolute left-2 top-2 rounded-full bg-black/70 p-1.5">
                    <Film className="h-3 w-3 text-white" />
                  </div>
                )}

                {/* Selection Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAsset(asset.public_id, !isSelected);
                  }}
                  className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-white/50 bg-black/50 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </button>

                {/* Hover Overlay */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3"
                  >
                    {/* Top Actions */}
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(asset);
                        }}
                        className="rounded-lg bg-black/70 p-2 text-white transition-colors hover:bg-emerald-500"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {permissions?.canViewAuditLogs && onViewAudit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewAudit(asset);
                          }}
                          className="rounded-lg bg-black/70 p-2 text-white transition-colors hover:bg-indigo-500"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRename(asset);
                        }}
                        className="rounded-lg bg-black/70 p-2 text-white transition-colors hover:bg-blue-500"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(asset);
                        }}
                        className="rounded-lg bg-black/70 p-2 text-white transition-colors hover:bg-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Bottom Info */}
                    <div className="space-y-1">
                      <p className="truncate text-xs font-medium text-white">
                        {asset.public_id.split('/').pop()}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatBytes(asset.bytes)}
                        </span>
                        <span>•</span>
                        <span>{asset.format.toUpperCase()}</span>
                      </div>
                      {asset.userId && (
                        <p className="truncate text-xs text-emerald-400">
                          {asset.userPath}: {asset.userId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
