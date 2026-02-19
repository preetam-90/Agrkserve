import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { disableAsset, enableAsset } from '@/lib/services/cloudinary-admin-service';
import { createMediaAuditLog } from '@/lib/services/media-audit-service';
import { extractRequestMetadata } from '@/lib/utils/request-utils';

export async function POST(request: NextRequest) {
  try {
    const admin = await requirePermission('canViewMedia');

    const body = await request.json();
    const { publicId, resourceType, disable, reason } = body;

    if (!publicId || typeof disable !== 'boolean' || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: publicId, disable, reason',
        },
        { status: 400 }
      );
    }

    // Disable or enable the asset
    const result = disable
      ? await disableAsset(publicId, resourceType)
      : await enableAsset(publicId, resourceType);

    // Log action
    try {
      const { ipAddress, userAgent } = extractRequestMetadata(request);
      await createMediaAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: disable ? 'disable' : 'enable',
        publicId,
        assetType: resourceType || 'image',
        details: { reason },
        ipAddress,
        userAgent,
      }).catch((err) => {
        console.warn('Audit log creation failed (non-critical):', err.message);
      });
    } catch (err) {
      console.warn('Audit logging error (non-critical):', err);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error('Disable/enable asset error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update asset status';
    const errorStatus =
      error instanceof Error && 'statusCode' in error
        ? (error as { statusCode?: number }).statusCode || 500
        : 500;
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: errorStatus }
    );
  }
}
