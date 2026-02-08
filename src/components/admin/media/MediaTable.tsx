'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Film,
  MoreVertical,
  Trash2,
  Edit3,
  Eye,
  Check,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { CloudinaryAssetWithUser, AdminPermissions } from '@/lib/types/cloudinary-admin';
import { format } from 'date-fns';

interface MediaTableProps {
  assets: CloudinaryAssetWithUser[];
  selectedAssets: Set<string>;
  onSelectAsset: (publicId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onPreview: (asset: CloudinaryAssetWithUser) => void;
  onDelete: (asset: CloudinaryAssetWithUser) => void;
  onRename: (asset: CloudinaryAssetWithUser) => void;
  isLoading?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewAudit?: (asset: CloudinaryAssetWithUser) => void;
  permissions?: AdminPermissions | null;
}

export function MediaTable({
  assets,
  selectedAssets,
  onSelectAsset,
  onSelectAll,
  onPreview,
  onDelete,
  onRename,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: MediaTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const allSelected = assets.length > 0 && assets.every((a) => selectedAssets.has(a.public_id));
  const someSelected = assets.some((a) => selectedAssets.has(a.public_id)) && !allSelected;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-[#1a1a1a]" />
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
      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[#262626]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#262626] bg-[#1a1a1a]">
              <th className="w-12 px-4 py-3">
                <button
                  onClick={() => onSelectAll(!allSelected)}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    allSelected
                      ? 'border-emerald-500 bg-emerald-500'
                      : someSelected
                        ? 'border-emerald-500 bg-emerald-500/50'
                        : 'border-[#262626] bg-[#0f0f0f] hover:border-neutral-500'
                  }`}
                >
                  {(allSelected || someSelected) && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Asset</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400">Uploaded</th>
              <th className="w-12 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {assets.map((asset) => {
              const isSelected = selectedAssets.has(asset.public_id);
              const isVideo = asset.resource_type === 'video';

              return (
                <motion.tr
                  key={asset.asset_id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`group cursor-pointer transition-colors hover:bg-[#1a1a1a] ${
                    isSelected ? 'bg-emerald-500/5' : ''
                  }`}
                  onClick={() => onPreview(asset)}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(asset.public_id, !isSelected);
                      }}
                      className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-[#262626] bg-[#0f0f0f] hover:border-neutral-500'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#0f0f0f]">
                        {asset.thumbnail_url ? (
                           

                          <Image
                            src={asset.thumbnail_url}
                            alt={asset.public_id}
                            fill
                            className="object-cover"
                            loading="lazy"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            {isVideo ? (
                              <Film className="h-5 w-5 text-neutral-600" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-neutral-600" />
                            )}
                          </div>
                        )}
                        {isVideo && (
                          <div className="absolute bottom-0.5 left-0.5 rounded bg-black/70 px-1 py-0.5">
                            <Film className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {asset.public_id.split('/').pop()}
                        </p>
                        <p className="truncate text-xs text-neutral-500">{asset.public_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#262626] px-2.5 py-1 text-xs text-neutral-300">
                      {isVideo ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                      {asset.format.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-300">
                      <HardDrive className="h-4 w-4 text-neutral-500" />
                      {formatBytes(asset.bytes)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {asset.userId ? (
                      <div className="space-y-0.5">
                        <p className="text-xs text-emerald-400">{asset.userPath}</p>
                        <p className="text-xs text-neutral-500">{asset.userId.slice(0, 12)}...</p>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-sm text-neutral-300">
                      <Calendar className="h-4 w-4 text-neutral-500" />
                      {formatDate(asset.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === asset.public_id ? null : asset.public_id);
                        }}
                        className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenu === asset.public_id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl border border-[#262626] bg-[#1a1a1a] shadow-xl"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreview(asset);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                            Preview
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRename(asset);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <Edit3 className="h-4 w-4" />
                            Rename
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(asset);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
