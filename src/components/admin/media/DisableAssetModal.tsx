'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ban, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { CloudinaryAssetWithUser } from '@/lib/types/cloudinary-admin';

interface DisableAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  asset: CloudinaryAssetWithUser | null;
  isDisabling?: boolean;
}

export function DisableAssetModal({
  isOpen,
  onClose,
  onConfirm,
  asset,
  isDisabling = false,
}: DisableAssetModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    try {
      await onConfirm(reason.trim());
      setReason('');
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update asset status');
    }
  };

  if (!isOpen || !asset) return null;

  const isCurrentlyDisabled = asset.status === 'disabled';
  const action = isCurrentlyDisabled ? 'Enable' : 'Disable';
  const actionLower = action.toLowerCase();

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
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                  isCurrentlyDisabled ? 'bg-emerald-500/10' : 'bg-yellow-500/10'
                }`}
              >
                {isCurrentlyDisabled ? (
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                ) : (
                  <Ban className="h-6 w-6 text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{action} Asset Delivery</h3>
                <p className="mt-1 text-sm text-neutral-400">
                  {isCurrentlyDisabled
                    ? 'This will re-enable public delivery of this asset.'
                    : 'This will disable public delivery of this asset without deleting it.'}
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isDisabling}
                className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Asset Info */}
              <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-3">
                <p className="text-xs font-medium text-neutral-500">Asset</p>
                <p className="mt-1 break-all text-sm text-white">{asset.public_id}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {asset.format.toUpperCase()} • {asset.width} × {asset.height}
                </p>
              </div>

              {/* Current Status */}
              <div className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-3">
                <p className="text-xs font-medium text-neutral-500">Current Status</p>
                <div className="mt-1">
                  {isCurrentlyDisabled ? (
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

              {/* Reason Input */}
              <div>
                <label className="text-xs font-medium text-neutral-300">
                  Reason for {action}ing
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                  }}
                  placeholder={`Why are you ${actionLower}ing this asset?`}
                  disabled={isDisabling}
                  rows={3}
                  className="mt-1.5 w-full resize-none rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Info Message */}
              {!isCurrentlyDisabled && (
                <div className="flex items-start gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Disabling an asset prevents it from being accessed via its public URL. The asset
                    remains in Cloudinary and can be re-enabled at any time.
                  </p>
                </div>
              )}

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
                disabled={isDisabling}
                className="flex-1 rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDisabling || !reason.trim()}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  isCurrentlyDisabled
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
              >
                {isDisabling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {action}ing...
                  </>
                ) : (
                  `${action} Asset`
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
