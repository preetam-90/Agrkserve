/**
 * TanStack Query hooks for Cloudinary Admin operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  MediaFilters,
  PaginatedMediaResponse,
  MediaAnalytics,
  UserMediaSummary,
  MediaAuditLog,
  BulkDeleteRequest,
  RenameAssetRequest,
} from '@/lib/types/cloudinary-admin';

// Query keys
const cloudinaryKeys = {
  all: ['cloudinary'] as const,
  assets: (filters: MediaFilters) => [...cloudinaryKeys.all, 'assets', filters] as const,
  asset: (publicId: string) => [...cloudinaryKeys.all, 'asset', publicId] as const,
  users: () => [...cloudinaryKeys.all, 'users'] as const,
  user: (userId: string) => [...cloudinaryKeys.all, 'user', userId] as const,
  analytics: () => [...cloudinaryKeys.all, 'analytics'] as const,
  auditLogs: (filters?: Record<string, unknown>) =>
    [...cloudinaryKeys.all, 'auditLogs', filters] as const,
};

// API functions
async function fetchAssets(filters: MediaFilters): Promise<PaginatedMediaResponse> {
  const params = new URLSearchParams();

  if (filters.resourceType && filters.resourceType !== 'all') {
    params.set('resourceType', filters.resourceType);
  }
  if (filters.folder) params.set('folder', filters.folder);
  if (filters.userId) params.set('userId', filters.userId);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  const url = `/api/admin/cloudinary/assets?${params}`;
  console.log('Fetching Cloudinary assets from:', url);

  const response = await fetch(url);
  console.log('Response status:', response.status);

  const data = await response.json();
  console.log('Response data:', data);

  if (!response.ok || !data.success) {
    console.error('Fetch failed:', data);
    throw new Error(data.error || 'Failed to fetch assets');
  }

  return data.data;
}

async function fetchUsersWithMedia(): Promise<UserMediaSummary[]> {
  const response = await fetch('/api/admin/cloudinary/users');
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch users');
  }

  return data.data;
}

async function fetchAnalytics(): Promise<MediaAnalytics & { usersWithMedia: UserMediaSummary[] }> {
  const response = await fetch('/api/admin/cloudinary/usage');
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch analytics');
  }

  return data.data;
}

async function fetchAuditLogs(filters?: Record<string, unknown>): Promise<{
  logs: MediaAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const params = new URLSearchParams();

  if (filters?.adminId) params.set('adminId', String(filters.adminId));
  if (filters?.action) params.set('action', String(filters.action));
  if (filters?.publicId) params.set('publicId', String(filters.publicId));
  if (filters?.dateFrom) params.set('dateFrom', String(filters.dateFrom));
  if (filters?.dateTo) params.set('dateTo', String(filters.dateTo));
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));

  const response = await fetch(`/api/admin/cloudinary/audit-logs?${params}`);

  // Defensive parsing: the audit-logs endpoint should return JSON, but in some
  // environments (auth redirects, proxy errors, HTML error pages) the body can
  // be non-JSON. Try to parse JSON and fall back to raw text for a clearer
  // error message.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any = null;
  let textBody: string | null = null;
  try {
    data = await response.clone().json();
  } catch (parseErr) {
    try {
      textBody = await response.clone().text();
    } catch (textErr) {
      console.error('Failed to read audit-logs response as text', textErr);
    }
    console.warn('Audit logs response is not JSON', parseErr, {
      status: response.status,
      textBody,
    });
  }

  if (!response.ok || !data || !data.success) {
    const errMsg =
      (data && (data.error || data.message)) ||
      textBody ||
      `Failed to fetch audit logs (${response.status}${response.statusText ? ` ${response.statusText}` : ''})`;

    throw new Error(errMsg);
  }

  return data.data;
}

async function deleteAsset(publicId: string, resourceType: string, reason?: string): Promise<void> {
  const params = new URLSearchParams({ publicId, resourceType });
  if (reason) params.set('reason', reason);

  const response = await fetch(`/api/admin/cloudinary/asset?${params}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to delete asset');
  }
}

async function bulkDeleteAssets(request: BulkDeleteRequest): Promise<{
  deleted: string[];
  failed: { publicId: string; error: string }[];
}> {
  const response = await fetch('/api/admin/cloudinary/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to bulk delete assets');
  }

  return data.data;
}

async function renameAsset(request: RenameAssetRequest): Promise<void> {
  const response = await fetch('/api/admin/cloudinary/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to rename asset');
  }
}

async function replaceAsset(
  publicId: string,
  file: File,
  reason: string,
  resourceType?: string
): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('publicId', publicId);
  formData.append('reason', reason);
  if (resourceType) {
    formData.append('resourceType', resourceType);
  }

  const response = await fetch('/api/admin/cloudinary/replace', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to replace asset');
  }
}

async function disableAsset(
  publicId: string,
  resourceType: string,
  disable: boolean,
  reason: string
): Promise<void> {
  const response = await fetch('/api/admin/cloudinary/disable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId, resourceType, disable, reason }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to update asset status');
  }
}

// Hooks
export function useCloudinaryAssets(filters: MediaFilters) {
  return useQuery({
    queryKey: cloudinaryKeys.assets(filters),
    queryFn: () => fetchAssets(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

function useCloudinaryUsers() {
  return useQuery({
    queryKey: cloudinaryKeys.users(),
    queryFn: fetchUsersWithMedia,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCloudinaryAnalytics() {
  return useQuery({
    queryKey: cloudinaryKeys.analytics(),
    queryFn: fetchAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function useCloudinaryAuditLogs(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: cloudinaryKeys.auditLogs(filters),
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30 * 1000,
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      publicId,
      resourceType,
      reason,
    }: {
      publicId: string;
      resourceType: string;
      reason?: string;
    }) => deleteAsset(publicId, resourceType, reason),
    onSuccess: () => {
      // Invalidate all asset queries
      queryClient.invalidateQueries({ queryKey: cloudinaryKeys.all });
    },
  });
}

export function useBulkDeleteAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteAssets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cloudinaryKeys.all });
    },
  });
}

export function useRenameAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cloudinaryKeys.all });
    },
  });
}

export function useReplaceAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      publicId,
      file,
      reason,
      resourceType,
    }: {
      publicId: string;
      file: File;
      reason: string;
      resourceType?: string;
    }) => replaceAsset(publicId, file, reason, resourceType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cloudinaryKeys.all });
    },
  });
}

export function useDisableAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      publicId,
      resourceType,
      disable,
      reason,
    }: {
      publicId: string;
      resourceType: string;
      disable: boolean;
      reason: string;
    }) => disableAsset(publicId, resourceType, disable, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cloudinaryKeys.all });
    },
  });
}
