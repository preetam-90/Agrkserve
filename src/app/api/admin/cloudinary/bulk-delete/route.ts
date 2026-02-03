/**
 * POST /api/admin/cloudinary/bulk-delete
 * Bulk delete Cloudinary assets
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteMultipleAssets } from '@/lib/services/cloudinary-admin-service';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { createMediaAuditLog, extractRequestMetadata } from '@/lib/services/media-audit-service';
import type { MediaType, BulkDeleteRequest } from '@/lib/types/cloudinary-admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check permission
    const admin = await requirePermission('canBulkDelete');

    // Parse request body
    const body: BulkDeleteRequest = await request.json();
    const { publicIds, reason } = body;

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'publicIds array is required' },
        { status: 400 }
      );
    }

    if (publicIds.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Maximum 100 assets can be deleted at once' },
        { status: 400 }
      );
    }

    // Delete assets (assume image type for bulk, can be enhanced)
    const result = await deleteMultipleAssets(publicIds, 'image');

    // Log the action
    const { ipAddress, userAgent } = extractRequestMetadata(request);
    await createMediaAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'bulk_delete',
      publicId: `bulk:${result.deleted.length}`,
      assetType: 'image',
      details: {
        reason,
        deletedCount: result.deleted.length,
        failedCount: result.failed.length,
        deletedIds: result.deleted,
        failedIds: result.failed,
      },
      ipAddress,
      userAgent,
    }).catch(() => {}); // Non-blocking

    return NextResponse.json({
      success: true,
      data: result,
      message: `Deleted ${result.deleted.length} assets, ${result.failed.length} failed`,
    });
  } catch (error) {
    console.error('Error bulk deleting Cloudinary assets:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to bulk delete assets' },
      { status: 500 }
    );
  }
}
