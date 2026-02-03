/**
 * Cloudinary Media Management Types
 * Types for the admin media control system
 */

// Admin Role Types for RBAC
export type AdminRole = 'super_admin' | 'moderator' | 'support_admin';

export interface AdminPermissions {
  canViewMedia: boolean;
  canDeleteMedia: boolean;
  canRenameMedia: boolean;
  canReplaceMedia: boolean;
  canFlagMedia: boolean;
  canViewAnalytics: boolean;
  canViewAuditLogs: boolean;
  canBulkDelete: boolean;
  canModerate: boolean;
  // Permission to manage (create/update/delete) users via admin panel
  canManageUsers: boolean;
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  super_admin: {
    canViewMedia: true,
    canDeleteMedia: true,
    canRenameMedia: true,
    canReplaceMedia: true,
    canFlagMedia: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canBulkDelete: true,
    canModerate: true,
    canManageUsers: true,
  },
  moderator: {
    canViewMedia: true,
    canDeleteMedia: false,
    canRenameMedia: false,
    canReplaceMedia: false,
    canFlagMedia: true,
    canViewAnalytics: false,
    canViewAuditLogs: false,
    canBulkDelete: false,
    canModerate: true,
    canManageUsers: false,
  },
  support_admin: {
    canViewMedia: true,
    canDeleteMedia: false,
    canRenameMedia: false,
    canReplaceMedia: false,
    canFlagMedia: false,
    canViewAnalytics: false,
    canViewAuditLogs: false,
    canBulkDelete: false,
    canModerate: false,
    canManageUsers: false,
  },
};

// Media Asset Types
export type MediaType = 'image' | 'video' | 'raw';
export type MediaStatus = 'active' | 'flagged' | 'disabled';

export interface CloudinaryAsset {
  asset_id: string;
  public_id: string;
  folder: string;
  filename: string;
  format: string;
  resource_type: MediaType;
  type: string;
  version: number;
  version_id: string;
  signature: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  created_at: string;
  uploaded_at: string;
  url: string;
  secure_url: string;
  thumbnail_url?: string;
  tags: string[];
  context?: Record<string, string>;
  metadata?: Record<string, unknown>;
  access_mode: string;
  moderation_status?: string;
}

export interface CloudinaryAssetWithUser extends CloudinaryAsset {
  userId?: string;
  userPath?: 'equipment' | 'labour' | 'profile' | 'other';
  assetId?: string;
  status: MediaStatus;
  moderationNotes?: string;
  flaggedBy?: string;
  flaggedAt?: string;
}

// User-wise media organization
export interface UserMediaSummary {
  userId: string;
  userName?: string;
  userEmail?: string;
  totalAssets: number;
  totalStorageBytes: number;
  imageCount: number;
  videoCount: number;
  equipmentAssets: number;
  labourAssets: number;
  profileAssets: number;
  lastUploadAt?: string;
  assets: CloudinaryAssetWithUser[];
}

// Media Filters
export interface MediaFilters {
  resourceType?: MediaType | 'all';
  folder?: string;
  userId?: string;
  status?: MediaStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'bytes' | 'public_id';
  sortOrder?: 'asc' | 'desc';
}

// Media Analytics
export interface MediaAnalytics {
  totalStorageBytes: number;
  totalAssets: number;
  imageCount: number;
  videoCount: number;
  rawCount: number;
  bandwidthUsed?: number;
  transformationsCount?: number;
  monthlyUploads: MonthlyUploadData[];
  storageByUser: UserStorageData[];
}

export interface MonthlyUploadData {
  month: string;
  year: number;
  imageCount: number;
  videoCount: number;
  totalBytes: number;
}

export interface UserStorageData {
  userId: string;
  userName?: string;
  totalBytes: number;
  assetCount: number;
}

// Media Audit Log
export type MediaActionType =
  | 'view'
  | 'delete'
  | 'bulk_delete'
  | 'rename'
  | 'replace'
  | 'flag'
  | 'unflag'
  | 'disable'
  | 'enable'
  | 'add_moderation_note'
  | 'view_analytics';

export interface MediaAuditLog {
  id: string;
  adminId: string;
  adminEmail?: string;
  adminRole: AdminRole;
  action: MediaActionType;
  publicId: string;
  assetType: MediaType;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// API Response Types
export interface PaginatedMediaResponse {
  assets: CloudinaryAssetWithUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface MediaActionResponse {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

// Bulk Operations
export interface BulkDeleteRequest {
  publicIds: string[];
  reason?: string;
}

export interface BulkDeleteResponse {
  success: boolean;
  deleted: string[];
  failed: { publicId: string; error: string }[];
  totalProcessed: number;
}

// Rename/Replace Operations
export interface RenameAssetRequest {
  publicId: string;
  newPublicId: string;
  resourceType?: string;
  reason: string;
}

export interface ReplaceAssetRequest {
  publicId: string;
  file: File;
  reason: string;
}

// Moderation
export interface FlagMediaRequest {
  publicId: string;
  reason: string;
  notes?: string;
}

export interface ModerationStatusUpdate {
  publicId: string;
  status: MediaStatus;
  notes?: string;
}

// Cloudinary API Response Types
export interface CloudinarySearchResponse {
  total_count: number;
  time: number;
  resources: CloudinaryAsset[];
  next_cursor?: string;
}

export interface CloudinaryUsageResponse {
  plan: string;
  last_updated: string;
  transformations: UsageMetric;
  objects: UsageMetric;
  bandwidth: UsageMetric;
  storage: UsageMetric;
  requests: number;
  resources: number;
  derived_resources: number;
  media_limits?: Record<string, number>;
}

export interface UsageMetric {
  usage: number;
  credits_usage?: number;
  used: number;
  limit?: number;
}
