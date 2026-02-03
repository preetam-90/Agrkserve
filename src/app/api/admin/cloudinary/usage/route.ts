/**
 * GET /api/admin/cloudinary/usage
 * Get Cloudinary usage analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsageAnalytics, getAllUsersWithMedia } from '@/lib/services/cloudinary-admin-service';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { createMediaAuditLog, extractRequestMetadata } from '@/lib/services/media-audit-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const admin = await requirePermission('canViewAnalytics');

    // Get usage analytics
    const analytics = await getUsageAnalytics();

    // Get all users with media for detailed breakdown
    const usersWithMedia = await getAllUsersWithMedia();

    // Log the action
    const { ipAddress, userAgent } = extractRequestMetadata(request);
    await createMediaAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'view_analytics',
      publicId: 'analytics',
      assetType: 'image',
      details: { totalStorage: analytics.totalStorageBytes },
      ipAddress,
      userAgent,
    }).catch(() => {}); // Non-blocking

    return NextResponse.json({
      success: true,
      data: {
        ...analytics,
        usersWithMedia,
      },
    });
  } catch (error) {
    console.error('Error fetching Cloudinary usage:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage analytics' },
      { status: 500 }
    );
  }
}
