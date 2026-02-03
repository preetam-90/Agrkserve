/**
 * GET /api/admin/cloudinary/users
 * Get all users with media and their storage usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllUsersWithMedia } from '@/lib/services/cloudinary-admin-service';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { createMediaAuditLog, extractRequestMetadata } from '@/lib/services/media-audit-service';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const admin = await requirePermission('canViewMedia');

    // Get all users with media
    const users = await getAllUsersWithMedia();

    // Log the action
    const { ipAddress, userAgent } = extractRequestMetadata(request);
    await createMediaAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'view',
      publicId: 'users-list',
      assetType: 'image',
      details: { userCount: users.length },
      ipAddress,
      userAgent,
    }).catch(() => {}); // Non-blocking

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users with media:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}
