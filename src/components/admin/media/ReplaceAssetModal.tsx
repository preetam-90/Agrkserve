'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, AlertCircle, Loader2, Image as ImageIcon, Film } from 'lucide-react';
import type { CloudinaryAssetWithUser } from '@/lib/types/cloudinary-admin';

interface ReplaceAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File, reason: string) => Promise<void>;
  asset: CloudinaryAssetWithUser | null;
  isReplacing?: boolean;
}

export function ReplaceAssetModal({
  isOpen,
  onClose,
  onConfirm,
  asset,
  isReplacing = false,
}: ReplaceAssetModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!asset) return;

    const isVideo = asset.resource_type === 'video';
    const isValidType = isVideo
      ? selectedFile.type.startsWith('video/')
      : selectedFile.type.startsWith('image/');

    if (!isValidType) {
      setError(`Please select a ${isVideo ? 'video' : 'image'} file`);
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleConfirm = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for replacing');
      return;
    }

    try {
      await onConfirm(file, reason.trim());
      setFile(null);
      setReason('');
      setError('');
      setPreview(null);
    } catch (err: any) {
      setError(err.message || 'Failed to replace asset');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen || !asset) return null;

  const isVideo = asset.resource_type === 'video';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#262626] bg-[#0f0f0f] p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                <Upload className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Replace Media</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Upload a new file without changing the URL. Perfect for fixing broken or
                  low-quality uploads.
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isReplacing}
                className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Current Asset Info */}
              <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-3">
                <p className="text-xs font-medium text-neutral-500">Current Asset</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-[#0f0f0f]">
                    {asset.thumbnail_url ? (
                      <img
                        src={asset.thumbnail_url}
                        alt={asset.public_id}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {isVideo ? (
                          <Film className="h-6 w-6 text-neutral-600" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-neutral-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {asset.public_id.split('/').pop()}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {asset.format.toUpperCase()} • {formatBytes(asset.bytes)}
                    </p>
                    <div className="mt-1 inline-block rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                      🔒 URL stays the same
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="text-xs font-medium text-neutral-300">
                  New {isVideo ? 'Video' : 'Image'} File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={isVideo ? 'video/*' : 'image/*'}
                  onChange={handleFileChange}
                  disabled={isReplacing}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isReplacing}
                  className="mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#262626] bg-[#1a1a1a] px-4 py-6 text-sm text-neutral-400 transition-colors hover:border-emerald-500/50 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-5 w-5" />
                  {file ? 'Change File' : `Click to upload ${isVideo ? 'video' : 'image'}`}
                </button>

                {/* Preview */}
                {preview && file && (
                  <div className="mt-3 rounded-lg border border-[#262626] bg-[#1a1a1a] p-3">
                    <p className="text-xs font-medium text-neutral-500">Preview</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-[#0f0f0f]">
                        {isVideo ? (
                          <video src={preview} className="h-full w-full object-cover" />
                        ) : (
                          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reason Input */}
              <div>
                <label className="text-xs font-medium text-neutral-300">
                  Reason for Replacement
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., 'Fixing low quality upload' or 'Replacing broken image'"
                  disabled={isReplacing}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Common reasons: Fix quality issues, replace broken upload, update outdated content
                </p>
              </div>

              {/* Info & Warning */}
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">URL Protection</p>
                    <p className="mt-0.5 text-xs text-blue-300">
                      The public_id and URL remain unchanged. Perfect for fixing broken uploads
                      without breaking links.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    The existing file will be permanently replaced. CDN cache will be cleared
                    automatically.
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                disabled={isReplacing}
                className="flex-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isReplacing || !file || !reason.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReplacing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  'Replace Asset'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
