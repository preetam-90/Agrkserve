import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { replaceAsset } from '@/lib/services/cloudinary-admin-service';
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

    const formData = await request.formData();
    const publicId = formData.get('publicId') as string;
    const file = formData.get('file') as File;
    const reason = formData.get('reason') as string;
    const resourceType = formData.get('resourceType') as string;

    if (!publicId || !file || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: publicId, file, reason',
        },
        { status: 400 }
      );
    }

    // Upload the new file
    const result = await replaceAsset(publicId, file, resourceType || 'image');

    // Log replace action
    try {
      const { ipAddress, userAgent } = extractRequestMetadata(request);
      await createMediaAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'replace',
        publicId,
        assetType: result.resource_type,
        details: {
          reason,
          newVersion: result.version,
          fileSize: file.size,
          fileName: file.name,
        },
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
    console.error('Replace asset error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to replace asset',
      },
      { status: error.statusCode || 500 }
    );
  }
}
