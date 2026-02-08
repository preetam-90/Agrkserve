'use client';

/* eslint-disable */

/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/preserve-manual-memoization */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Image as ImageIcon,
  Trash2,
  BarChart3,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  useCloudinaryAssets,
  useCloudinaryAnalytics,
  useDeleteAsset,
  useBulkDeleteAssets,
  useRenameAsset,
  useReplaceAsset,
  useDisableAsset,
} from '@/lib/hooks/use-cloudinary-admin';
import type {
  MediaFilters,
  CloudinaryAssetWithUser,
  AdminPermissions,
} from '@/lib/types/cloudinary-admin';
import { MediaFiltersBar } from '@/components/admin/media/MediaFiltersBar';
import { MediaGrid } from '@/components/admin/media/MediaGrid';
import { MediaTable } from '@/components/admin/media/MediaTable';
import { MediaPreviewModal } from '@/components/admin/media/MediaPreviewModal';
import { DeleteConfirmationModal } from '@/components/admin/media/DeleteConfirmationModal';
import { BulkDeleteModal } from '@/components/admin/media/BulkDeleteModal';
import { MediaAnalyticsDashboard } from '@/components/admin/media/MediaAnalyticsDashboard';
import { RenameAssetModal } from '@/components/admin/media/RenameAssetModal';
import { ReplaceAssetModal } from '@/components/admin/media/ReplaceAssetModal';
import { DisableAssetModal } from '@/components/admin/media/DisableAssetModal';
import toast from 'react-hot-toast';

type Tab = 'assets' | 'analytics';

export default function CloudinaryMediaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('assets');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<MediaFilters>({
    page: 1,
    limit: 50,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Selection state
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  // Modal states
  const [previewAsset, setPreviewAsset] = useState<CloudinaryAssetWithUser | null>(null);
  const [deleteAsset, setDeleteAsset] = useState<CloudinaryAssetWithUser | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [renameAsset, setRenameAsset] = useState<CloudinaryAssetWithUser | null>(null);
  const [replaceAsset, setReplaceAsset] = useState<CloudinaryAssetWithUser | null>(null);
  const [disableAsset, setDisableAsset] = useState<CloudinaryAssetWithUser | null>(null);

  // Data fetching
  const {
    data: assetsData,
    isLoading: isLoadingAssets,
    error: assetsError,
  } = useCloudinaryAssets(filters);
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useCloudinaryAnalytics();

  // Mutations
  const deleteMutation = useDeleteAsset();
  const bulkDeleteMutation = useBulkDeleteAssets();
  const renameMutation = useRenameAsset();
  const replaceMutation = useReplaceAsset();
  const disableMutation = useDisableAsset();
  const router = useRouter();

  // Permissions
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPermissions() {
      try {
        const res = await fetch('/api/admin/permissions');
        if (!res.ok) return;
        const json = await res.json();
        if (json?.success && json.data?.permissions) {
          if (!mounted) return;
          setPermissions(json.data.permissions as AdminPermissions);
        }
      } catch (err) {
        console.warn('Failed to load admin permissions', err);
      }
    }

    loadPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleViewAudit = useCallback(
    (asset: CloudinaryAssetWithUser) => {
      router.push(`/admin/cloudinary/audit-logs?publicId=${encodeURIComponent(asset.public_id)}`);
    },
    [router]
  );

  // Handlers
  const handleSelectAsset = useCallback((publicId: string, selected: boolean) => {
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(publicId);
      } else {
        next.delete(publicId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    // eslint-disable-next-line preserved

    (selected: boolean) => {
      if (selected && assetsData?.assets) {
        setSelectedAssets(new Set(assetsData.assets.map((a) => a.public_id)));
      } else {
        setSelectedAssets(new Set());
      }
    },
    [assetsData?.assets]
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    setSelectedAssets(new Set());
  }, []);

  const handleDeleteConfirm = async (reason: string) => {
    if (!deleteAsset) return;

    try {
      await deleteMutation.mutateAsync({
        publicId: deleteAsset.public_id,
        resourceType: deleteAsset.resource_type,
        reason,
      });

      toast.success('Asset deleted successfully');
      setDeleteAsset(null);
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const handleBulkDeleteConfirm = async (reason: string) => {
    if (selectedAssets.size === 0) return;

    try {
      const result = await bulkDeleteMutation.mutateAsync({
        publicIds: Array.from(selectedAssets),
        reason,
      });

      if (result.failed.length > 0) {
        toast(`Deleted ${result.deleted.length} assets, ${result.failed.length} failed`, {
          icon: '⚠️',
        });
      } else {
        toast.success(`Deleted ${result.deleted.length} assets successfully`);
      }

      setSelectedAssets(new Set());
      setShowBulkDelete(false);
    } catch (error) {
      toast.error('Failed to delete assets');
    }
  };

  const handleRenameConfirm = async (newPublicId: string, reason: string) => {
    if (!renameAsset) return;

    try {
      await renameMutation.mutateAsync({
        publicId: renameAsset.public_id,
        newPublicId,
        resourceType: renameAsset.resource_type,
        reason,
      });

      toast.success('Asset renamed successfully');
      setRenameAsset(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename asset');
      throw error;
    }
  };

  const handleReplaceConfirm = async (file: File, reason: string) => {
    if (!replaceAsset) return;

    try {
      await replaceMutation.mutateAsync({
        publicId: replaceAsset.public_id,
        file,
        reason,
        resourceType: replaceAsset.resource_type,
      });

      toast.success('Asset replaced successfully');
      setReplaceAsset(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to replace asset');
      throw error;
    }
  };

  const handleDisableConfirm = async (reason: string) => {
    if (!disableAsset) return;

    const isCurrentlyDisabled = disableAsset.status === 'disabled';

    try {
      await disableMutation.mutateAsync({
        publicId: disableAsset.public_id,
        resourceType: disableAsset.resource_type,
        disable: !isCurrentlyDisabled,
        reason,
      });

      toast.success(`Asset ${isCurrentlyDisabled ? 'enabled' : 'disabled'} successfully`);
      setDisableAsset(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update asset status');
      throw error;
    }
  };

  const tabs = [
    { id: 'assets' as Tab, label: 'Media Assets', icon: ImageIcon },
    { id: 'analytics' as Tab, label: 'Storage & Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cloudinary Media Manager</h1>
          <p className="text-neutral-400">Manage and monitor all media assets</p>
        </div>

        {/* Bulk Actions */}
        {selectedAssets.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-[#262626] bg-[#1a1a1a] px-4 py-2"
          >
            <span className="text-sm text-neutral-400">{selectedAssets.size} selected</span>
            <button
              onClick={() => setShowBulkDelete(true)}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#262626]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'assets' && (
          <div className="space-y-6">
            {/* Filters */}
            <MediaFiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              users={[]}
            />

            {/* Error State */}
            {assetsError && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-sm text-red-400">Failed to load assets. Please try again.</p>
              </div>
            )}

            {/* Assets Grid/Table */}
            {viewMode === 'grid' ? (
              <MediaGrid
                assets={assetsData?.assets || []}
                selectedAssets={selectedAssets}
                onSelectAsset={handleSelectAsset}
                onSelectAll={handleSelectAll}
                onPreview={setPreviewAsset}
                onDelete={setDeleteAsset}
                onRename={setRenameAsset}
                isLoading={isLoadingAssets}
                onViewAudit={handleViewAudit}
                permissions={permissions}
              />
            ) : (
              <MediaTable
                assets={assetsData?.assets || []}
                selectedAssets={selectedAssets}
                onSelectAsset={handleSelectAsset}
                onSelectAll={handleSelectAll}
                onPreview={setPreviewAsset}
                onDelete={setDeleteAsset}
                onRename={setRenameAsset}
                isLoading={isLoadingAssets}
                page={assetsData?.page || 1}
                totalPages={assetsData?.totalPages || 1}
                onPageChange={handlePageChange}
                onViewAudit={handleViewAudit}
                permissions={permissions}
              />
            )}

            {/* Pagination */}
            {assetsData && assetsData.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page! <= 1}
                  className="rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-neutral-400">
                  Page {assetsData.page} of {assetsData.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page! >= assetsData.totalPages}
                  className="rounded-lg border border-[#262626] bg-[#1a1a1a] px-4 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            {isLoadingAnalytics ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : analyticsData ? (
              <MediaAnalyticsDashboard analytics={analyticsData} isLoading={isLoadingAnalytics} />
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-neutral-400">No analytics data available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <MediaPreviewModal
        isOpen={!!previewAsset}
        onClose={() => setPreviewAsset(null)}
        asset={previewAsset}
        assets={assetsData?.assets}
        onDelete={setDeleteAsset}
        onRename={setRenameAsset}
        onDisable={setDisableAsset}
        onReplace={setReplaceAsset}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteAsset}
        onClose={() => setDeleteAsset(null)}
        onConfirm={handleDeleteConfirm}
        asset={deleteAsset}
        isDeleting={deleteMutation.isPending}
      />

      <BulkDeleteModal
        isOpen={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={handleBulkDeleteConfirm}
        selectedCount={selectedAssets.size}
        isDeleting={bulkDeleteMutation.isPending}
      />

      <RenameAssetModal
        isOpen={!!renameAsset}
        onClose={() => setRenameAsset(null)}
        onConfirm={handleRenameConfirm}
        asset={renameAsset}
        isRenaming={renameMutation.isPending}
      />

      <ReplaceAssetModal
        isOpen={!!replaceAsset}
        onClose={() => setReplaceAsset(null)}
        onConfirm={handleReplaceConfirm}
        asset={replaceAsset}
        isReplacing={replaceMutation.isPending}
      />

      <DisableAssetModal
        isOpen={!!disableAsset}
        onClose={() => setDisableAsset(null)}
        onConfirm={handleDisableConfirm}
        asset={disableAsset}
        isDisabling={disableMutation.isPending}
      />
    </div>
  );
}
