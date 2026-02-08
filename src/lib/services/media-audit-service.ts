/**
 * Media Audit Log Service
 * Tracks all admin actions on Cloudinary media
 */

import { createClient } from '@/lib/supabase/server';
import type {
  MediaAuditLog,
  MediaActionType,
  AdminRole,
  MediaType,
} from '@/lib/types/cloudinary-admin';

export interface CreateMediaAuditLogParams {
  adminId: string;
  adminEmail?: string;
  adminRole: AdminRole;
  action: MediaActionType;
  publicId: string;
  assetType: MediaType;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface MediaAuditLogFilters {
  adminId?: string;
  action?: MediaActionType;
  publicId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * Create a media audit log entry
 */
export async function createMediaAuditLog(
  params: CreateMediaAuditLogParams
): Promise<MediaAuditLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('media_audit_logs')
    .insert({
      admin_id: params.adminId,
      admin_email: params.adminEmail,
      admin_role: params.adminRole,
      action: params.action,
      public_id: params.publicId,
      asset_type: params.assetType,
      details: params.details || {},
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create media audit log:', error);
    throw new Error('Failed to create audit log');
  }

  return transformAuditLog(data);
}

/**
 * Get media audit logs with filters
 */
export async function getMediaAuditLogs(filters: MediaAuditLogFilters = {}): Promise<{
  logs: MediaAuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const supabase = await createClient();

  const { adminId, action, publicId, dateFrom, dateTo, page = 1, limit = 50 } = filters;

  let query = supabase.from('media_audit_logs').select('*', { count: 'exact' });

  if (adminId) {
    query = query.eq('admin_id', adminId);
  }

  if (action) {
    query = query.eq('action', action);
  }

  if (publicId) {
    query = query.eq('public_id', publicId);
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  const offset = (page - 1) * limit;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch media audit logs:', error);
    throw new Error('Failed to fetch audit logs');
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    logs: (data || []).map(transformAuditLog),
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get audit logs for a specific asset
 */
export async function getAssetAuditLogs(
  publicId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ logs: MediaAuditLog[]; total: number }> {
  const result = await getMediaAuditLogs({ publicId, page, limit });
  return { logs: result.logs, total: result.total };
}

/**
 * Get audit logs for a specific admin
 */
export async function getAdminAuditLogs(
  adminId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ logs: MediaAuditLog[]; total: number }> {
  const result = await getMediaAuditLogs({ adminId, page, limit });
  return { logs: result.logs, total: result.total };
}

/**
 * Get recent audit logs (for dashboard)
 */
export async function getRecentAuditLogs(limit: number = 20): Promise<MediaAuditLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('media_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch recent audit logs:', error);
    return [];
  }

  return (data || []).map(transformAuditLog);
}

/**
 * Get audit log statistics
 */
export async function getAuditLogStats(
  dateFrom?: string,
  dateTo?: string
): Promise<{
  totalActions: number;
  actionsByType: Record<MediaActionType, number>;
  topAdmins: { adminId: string; adminEmail?: string; count: number }[];
}> {
  const supabase = await createClient();

  let query = supabase.from('media_audit_logs').select('*');

  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo);
  }

  const { data, error } = await query;

  if (error || !data) {
    return {
      totalActions: 0,
      actionsByType: {} as Record<MediaActionType, number>,
      topAdmins: [],
    };
  }

  // Count actions by type
  const actionsByType: Partial<Record<MediaActionType, number>> = {};
  const adminCounts: Record<string, { adminId: string; adminEmail?: string; count: number }> = {};

  for (const log of data) {
    const action = log.action as MediaActionType;
    actionsByType[action] = (actionsByType[action] || 0) + 1;

    if (!adminCounts[log.admin_id]) {
      adminCounts[log.admin_id] = {
        adminId: log.admin_id,
        adminEmail: log.admin_email,
        count: 0,
      };
    }
    adminCounts[log.admin_id].count++;
  }

  const topAdmins = Object.values(adminCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalActions: data.length,
    actionsByType: actionsByType as Record<MediaActionType, number>,
    topAdmins,
  };
}

/**
 * Transform database row to MediaAuditLog type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAuditLog(row: any): MediaAuditLog {
  return {
    id: row.id,
    adminId: row.admin_id,
    adminEmail: row.admin_email,
    adminRole: row.admin_role as AdminRole,
    action: row.action as MediaActionType,
    publicId: row.public_id,
    assetType: row.asset_type as MediaType,
    details: row.details || {},
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  };
}

/**
 * Helper to extract IP and user agent from request
 */
export function extractRequestMetadata(request: Request): {
  ipAddress?: string;
  userAgent?: string;
} {
  const headers = request.headers;

  // Try to get IP from various headers
  const ipAddress =
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    undefined;

  const userAgent = headers.get('user-agent') || undefined;

  return { ipAddress, userAgent };
}
