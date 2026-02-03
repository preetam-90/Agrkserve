/**
 * GET /api/admin/cloudinary/audit-logs
 * Get media audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMediaAuditLogs } from '@/lib/services/media-audit-service';
import { requirePermission } from '@/lib/utils/admin-rbac';
import type { MediaAuditLogFilters } from '@/lib/services/media-audit-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const admin = await requirePermission('canViewAuditLogs');

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const filters: MediaAuditLogFilters = {
      adminId: searchParams.get('adminId') || undefined,
      action: (searchParams.get('action') as any) || undefined,
      publicId: searchParams.get('publicId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: Math.min(parseInt(searchParams.get('limit') || '50', 10), 100),
    };

    const result = await getMediaAuditLogs(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
