import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { disableAsset, enableAsset } from '@/lib/services/cloudinary-admin-service';
import { createMediaAuditLog } from '@/lib/services/media-audit-service';

function extractRequestMetadata(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

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
  } catch (error: any) {
    console.error('Disable/enable asset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update asset status',
      },
      { status: error.statusCode || 500 }
    );
  }
}
