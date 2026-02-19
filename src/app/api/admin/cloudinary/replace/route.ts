import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { replaceAsset } from '@/lib/services/cloudinary-admin-service';
import { createMediaAuditLog } from '@/lib/services/media-audit-service';
import type { MediaType } from '@/lib/types/cloudinary-admin';
import { extractRequestMetadata } from '@/lib/utils/request-utils';

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
    const result = (await replaceAsset(publicId, file, resourceType || 'image')) as {
      resource_type?: string;
      version?: number;
    };

    // Log replace action
    try {
      const { ipAddress, userAgent } = extractRequestMetadata(request);
      await createMediaAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'replace',
        publicId,
        assetType: (result.resource_type as MediaType) || 'image',
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
  } catch (error: unknown) {
    console.error('Replace asset error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to replace asset';
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
