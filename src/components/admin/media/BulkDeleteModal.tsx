'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  selectedCount: number;
  isDeleting: boolean;
}

export function BulkDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  isDeleting,
}: BulkDeleteModalProps) {
  const [reason, setReason] = useState('');
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onConfirm(reason);
      setStep(1);
      setReason('');
    }
  };

  const handleClose = () => {
    setStep(1);
    setReason('');
    onClose();
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
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-red-500/20 bg-[#0f0f0f] shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-red-500/20 bg-red-500/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Bulk Delete</h3>
                  <p className="text-sm text-neutral-400">Delete multiple assets</p>
                </div>
                <button
                  onClick={handleClose}
                  className="ml-auto rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4 text-center">
                      <p className="text-3xl font-bold text-white">{selectedCount}</p>
                      <p className="text-sm text-neutral-400">assets selected for deletion</p>
                    </div>

                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                      <p className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Warning: This will permanently delete all selected assets
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-400">
                      Please provide a reason for bulk deletion (required for audit log):
                    </p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for deletion..."
                      className="w-full rounded-xl border border-[#262626] bg-[#1a1a1a] p-3 text-sm text-white placeholder-neutral-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-[#262626] p-4">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-[#262626] bg-transparent px-4 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={(step === 2 && !reason.trim()) || isDeleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : step === 1 ? (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Continue
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete {selectedCount} Assets
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
