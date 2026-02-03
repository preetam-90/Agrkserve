'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Eye,
  Download,
  Calendar,
  HardDrive,
  Image as ImageIcon,
  Film,
  Copy,
  Check,
  Trash2,
  Edit3,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AdminPermissions } from '@/lib/types/cloudinary-admin';
import type { CloudinaryAssetWithUser } from '@/lib/types/cloudinary-admin';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: CloudinaryAssetWithUser | null;
  assets?: CloudinaryAssetWithUser[];
  onDelete?: (asset: CloudinaryAssetWithUser) => void;
  onRename?: (asset: CloudinaryAssetWithUser) => void;
  onDisable?: (asset: CloudinaryAssetWithUser) => void;
  onReplace?: (asset: CloudinaryAssetWithUser) => void;
}

export function MediaPreviewModal({
  isOpen,
  onClose,
  asset,
  assets = [],
  onDelete,
  onRename,
  onDisable,
  onReplace,
}: MediaPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [auditCount, setAuditCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadPermissionsAndCount() {
      if (!asset) return;

      try {
        const res = await fetch('/api/admin/permissions');
        if (!res.ok) return;
        const json = await res.json();

        if (json?.success && json.data?.permissions) {
          if (!mounted) return;
          setPermissions(json.data.permissions as AdminPermissions);

          // Only fetch audit count when admin can view audit logs (server enforces stricter permission)
          if (json.data.permissions.canViewAuditLogs) {
            const params = new URLSearchParams();
            params.set('publicId', asset.public_id);
            params.set('limit', '1');

            const countRes = await fetch(`/api/admin/cloudinary/audit-logs?${params.toString()}`);

            // Defensive parsing: some error responses may be non-JSON (HTML error pages,
            // proxies, or empty bodies). Attempt to parse JSON and fall back to raw
            // text for diagnostics.
            let countJson: any = null;
            let countText: string | null = null;
            try {
              countJson = await countRes.clone().json();
            } catch (parseErr) {
              try {
                countText = await countRes.clone().text();
              } catch (textErr) {
                console.error('Failed to read audit count response as text', textErr);
              }
              console.warn('Audit count response is not JSON', parseErr, {
                status: countRes.status,
                text: countText,
              });
            }

            if (!countRes.ok) {
              // Permission or server error — don't block the modal UI. Log details so
              // server-side issues can be diagnosed from the browser console.
              if (countRes.status === 401 || countRes.status === 403) {
                console.warn('No permission to fetch audit count', {
                  status: countRes.status,
                  body: countJson || countText,
                });
              } else {
                console.warn('Failed to fetch audit count', {
                  status: countRes.status,
                  body: countJson || countText,
                });
              }
              setAuditCount(null);
              return;
            }

            if (countJson && countJson.success && countJson.data) {
              if (!mounted) return;
              setAuditCount(Number(countJson.data.total || 0));
            } else if (countJson && !countJson.success) {
              console.warn('Audit count endpoint returned success=false', countJson);
              setAuditCount(null);
            } else {
              // 200 OK but non-JSON body — treat as unknown and don't show a badge.
              setAuditCount(null);
            }
          }
        }
      } catch (err) {
        // Non-critical - permissions or audit count failing should not break the modal
        console.warn('Failed to load permissions/audit count', err);
      }
    }

    loadPermissionsAndCount();

    return () => {
      mounted = false;
    };
  }, [asset]);

  if (!isOpen || !asset) return null;

  const isVideo = asset.resource_type === 'video';
  const isImage = asset.resource_type === 'image';

  // Navigation
  const currentIndex = assets.findIndex((a) => a.public_id === asset.public_id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < assets.length - 1 && currentIndex !== -1;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`Copied ${field} to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 overflow-hidden rounded-2xl border border-[#262626] bg-[#0f0f0f] lg:inset-8"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#262626] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    {isVideo ? (
                      <Film className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="max-w-md truncate font-semibold text-white">
                      {asset.public_id.split('/').pop()}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {asset.format.toUpperCase()} • {formatBytes(asset.bytes)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={asset.secure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    Open
                  </a>
                  <a
                    href={asset.secure_url}
                    download
                    className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Preview */}
                <div className="relative flex flex-1 items-center justify-center bg-black/50 p-8">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                    </div>
                  )}

                  {isVideo ? (
                    <video
                      src={asset.secure_url}
                      controls
                      className="max-h-full max-w-full rounded-lg"
                      onLoadedData={() => setIsLoading(false)}
                    />
                  ) : (
                    <img
                      src={asset.secure_url}
                      alt={asset.public_id}
                      className="max-h-full max-w-full rounded-lg object-contain"
                      onLoad={() => setIsLoading(false)}
                    />
                  )}

                  {/* Navigation Arrows */}
                  {assets.length > 1 && (
                    <>
                      {hasPrev && (
                        <button
                          onClick={() => {
                            const prevAsset = assets[currentIndex - 1];
                            onClose();
                            setTimeout(() => {
                              // This would need to be handled by parent component
                              // For now, we'll just close and let parent handle it
                            }, 100);
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white transition-colors hover:bg-emerald-500"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                      )}
                      {hasNext && (
                        <button
                          onClick={() => {
                            const nextAsset = assets[currentIndex + 1];
                            onClose();
                            setTimeout(() => {
                              // This would need to be handled by parent component
                            }, 100);
                          }}
                          className="absolute right-[21rem] top-1/2 -translate-y-1/2 rounded-full bg-black/70 p-3 text-white transition-colors hover:bg-emerald-500"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Sidebar Info */}
                <div className="w-80 overflow-y-auto border-l border-[#262626] bg-[#0a0a0a]">
                  {/* Action Buttons */}
                  <div className="border-b border-[#262626] p-4">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {onRename && (
                        <button
                          onClick={() => {
                            onRename(asset);
                            onClose();
                          }}
                          className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Edit3 className="h-4 w-4" />
                          Rename
                        </button>
                      )}
                      {onReplace && (
                        <button
                          onClick={() => {
                            onReplace(asset);
                            onClose();
                          }}
                          className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Upload className="h-4 w-4" />
                          Replace
                        </button>
                      )}
                      {onDisable && (
                        <button
                          onClick={() => {
                            onDisable(asset);
                            onClose();
                          }}
                          className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-yellow-500/10 hover:text-yellow-400"
                        >
                          {asset.status === 'disabled' ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Enable
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4" />
                              Disable
                            </>
                          )}
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(asset);
                            onClose();
                          }}
                          className="flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                      {permissions?.canViewAuditLogs && (
                        <button
                          onClick={() =>
                            router.push(
                              `/admin/cloudinary/audit-logs?publicId=${encodeURIComponent(
                                asset.public_id
                              )}`
                            )
                          }
                          className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <FileText className="h-4 w-4" />
                          View audit history
                          {auditCount !== null && (
                            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-[#0b0b0b] px-2 py-0.5 text-xs text-neutral-300">
                              {auditCount}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Asset Details
                    </h4>

                    <div className="space-y-3">
                      {/* Public ID */}
                      <div className="group rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500">Public ID</p>
                            <p className="mt-1 break-all text-sm text-neutral-300">
                              {asset.public_id}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(asset.public_id, 'Public ID')}
                            className="ml-2 rounded p-1 text-neutral-500 opacity-0 transition-all hover:text-emerald-400 group-hover:opacity-100"
                          >
                            {copiedField === 'Public ID' ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Folder */}
                      <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                        <p className="text-xs text-neutral-500">Folder</p>
                        <p className="mt-1 text-sm text-neutral-300">{asset.folder || 'Root'}</p>
                      </div>

                      {/* User Info */}
                      {asset.userId && (
                        <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                          <p className="text-xs text-neutral-500">Uploaded By</p>
                          <p className="mt-1 text-sm text-neutral-300">{asset.userId}</p>
                          {asset.userPath && (
                            <p className="mt-1 text-xs text-emerald-400">{asset.userPath}</p>
                          )}
                        </div>
                      )}

                      {/* Dimensions */}
                      {(asset.width || asset.height) && (
                        <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                          <p className="text-xs text-neutral-500">Dimensions</p>
                          <p className="mt-1 text-sm text-neutral-300">
                            {asset.width} × {asset.height} px
                          </p>
                        </div>
                      )}

                      {/* Duration (for videos) */}
                      {asset.duration && (
                        <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                          <p className="text-xs text-neutral-500">Duration</p>
                          <p className="mt-1 text-sm text-neutral-300">
                            {Math.round(asset.duration)} seconds
                          </p>
                        </div>
                      )}

                      {/* File Size */}
                      <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                        <p className="text-xs text-neutral-500">File Size</p>
                        <div className="mt-1 flex items-center gap-2">
                          <HardDrive className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm text-neutral-300">
                            {formatBytes(asset.bytes)}
                          </span>
                        </div>
                      </div>

                      {/* Format */}
                      <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                        <p className="text-xs text-neutral-500">Format</p>
                        <p className="mt-1 text-sm text-neutral-300">
                          {asset.format.toUpperCase()}
                        </p>
                      </div>

                      {/* Created At */}
                      <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                        <p className="text-xs text-neutral-500">Uploaded</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-neutral-500" />
                          <span className="text-sm text-neutral-300">
                            {formatDate(asset.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">
                          {format(new Date(asset.created_at), 'PPpp')}
                        </p>
                      </div>

                      {/* URL */}
                      <div className="group rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-neutral-500">Cloudinary URL</p>
                            <p className="mt-1 break-all text-xs text-neutral-400">
                              {asset.secure_url}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(asset.secure_url, 'URL')}
                            className="ml-2 rounded p-1 text-neutral-500 opacity-0 transition-all hover:text-emerald-400 group-hover:opacity-100"
                          >
                            {copiedField === 'URL' ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {asset.status && (
                        <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-3">
                          <p className="text-xs text-neutral-500">Status</p>
                          <div className="mt-1">
                            {asset.status === 'disabled' ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-400">
                                <Ban className="h-3 w-3" />
                                Disabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                                <CheckCircle className="h-3 w-3" />
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
