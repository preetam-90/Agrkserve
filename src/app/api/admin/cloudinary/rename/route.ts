/**
 * POST /api/admin/cloudinary/rename
 * Rename a Cloudinary asset
 */

import { NextRequest, NextResponse } from 'next/server';
import { renameAsset } from '@/lib/services/cloudinary-admin-service';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { createMediaAuditLog, extractRequestMetadata } from '@/lib/services/media-audit-service';
import type { MediaType, RenameAssetRequest } from '@/lib/types/cloudinary-admin';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Check permission
    const admin = await requirePermission('canRenameMedia');

    // Parse request body
    const body: RenameAssetRequest = await request.json();
    const { publicId, newPublicId } = body;
    const resourceType = (body as any).resourceType || ('image' as MediaType);

    if (!publicId || !newPublicId) {
      return NextResponse.json(
        { success: false, error: 'publicId and newPublicId are required' },
        { status: 400 }
      );
    }

    // Rename the asset
    await renameAsset(publicId, newPublicId, resourceType);

    // Log the action
    const { ipAddress, userAgent } = extractRequestMetadata(request);
    await createMediaAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'rename',
      publicId,
      assetType: resourceType,
      details: { newPublicId },
      ipAddress,
      userAgent,
    }).catch(() => {}); // Non-blocking

    return NextResponse.json({
      success: true,
      message: 'Asset renamed successfully',
      data: { oldPublicId: publicId, newPublicId },
    });
  } catch (error) {
    console.error('Error renaming Cloudinary asset:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: false, error: 'Failed to rename asset' }, { status: 500 });
  }
}
