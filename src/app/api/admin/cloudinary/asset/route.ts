/**
 * DELETE /api/admin/cloudinary/asset
 * Delete a single Cloudinary asset
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteAsset } from '@/lib/services/cloudinary-admin-service';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { createMediaAuditLog, extractRequestMetadata } from '@/lib/services/media-audit-service';
import type { MediaType } from '@/lib/types/cloudinary-admin';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  try {
    // Check permission
    const admin = await requirePermission('canDeleteMedia');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    const resourceType = (searchParams.get('resourceType') || 'image') as MediaType;
    const reason = searchParams.get('reason') || undefined;

    if (!publicId) {
      return NextResponse.json({ success: false, error: 'publicId is required' }, { status: 400 });
    }

    // Delete the asset
    await deleteAsset(publicId, resourceType);

    // Log the action
    const { ipAddress, userAgent } = extractRequestMetadata(request);
    await createMediaAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'delete',
      publicId,
      assetType: resourceType,
      details: { reason },
      ipAddress,
      userAgent,
    }).catch(() => {}); // Non-blocking

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting Cloudinary asset:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: false, error: 'Failed to delete asset' }, { status: 500 });
  }
}
