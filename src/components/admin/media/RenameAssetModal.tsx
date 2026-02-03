'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import type { CloudinaryAssetWithUser } from '@/lib/types/cloudinary-admin';

interface RenameAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newPublicId: string, reason: string) => Promise<void>;
  asset: CloudinaryAssetWithUser | null;
  isRenaming?: boolean;
}

export function RenameAssetModal({
  isOpen,
  onClose,
  onConfirm,
  asset,
  isRenaming = false,
}: RenameAssetModalProps) {
  const [newName, setNewName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!newName.trim()) {
      setError('Please enter a new name');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for renaming');
      return;
    }

    try {
      await onConfirm(newName.trim(), reason.trim());
      setNewName('');
      setReason('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to rename asset');
    }
  };

  if (!isOpen || !asset) return null;

  const currentName = asset.public_id.split('/').pop() || asset.public_id;
  const folderPath = asset.public_id.split('/').slice(0, -1).join('/');

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
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#262626] bg-[#0f0f0f] p-6"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                <Edit3 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Rename Asset</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  Rename this asset. This will update all references to the file.
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isRenaming}
                className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Current Name */}
              <div>
                <label className="text-xs font-medium text-neutral-500">Current Name</label>
                <div className="mt-1.5 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2">
                  <p className="break-all text-sm text-neutral-400">{currentName}</p>
                </div>
              </div>

              {/* Folder Path */}
              {folderPath && (
                <div>
                  <label className="text-xs font-medium text-neutral-500">Folder</label>
                  <div className="mt-1.5 rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2">
                    <p className="break-all text-sm text-neutral-400">{folderPath}</p>
                  </div>
                </div>
              )}

              {/* New Name Input */}
              <div>
                <label className="text-xs font-medium text-neutral-300">New Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter new name (without extension)"
                  disabled={isRenaming}
                  className="mt-1.5 w-full rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Full path: {folderPath ? `${folderPath}/` : ''}
                  {newName || '...'}.{asset.format}
                </p>
              </div>

              {/* Reason Input */}
              <div>
                <label className="text-xs font-medium text-neutral-300">Reason for Change</label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                  }}
                  placeholder="Why are you renaming this asset?"
                  disabled={isRenaming}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
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
                disabled={isRenaming}
                className="flex-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isRenaming || !newName.trim() || !reason.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRenaming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Renaming...
                  </>
                ) : (
                  'Rename Asset'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
