/**
 * GET /api/admin/permissions
 * Returns current admin user info and their permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserWithRole } from '@/lib/utils/admin-rbac';
import { ROLE_PERMISSIONS } from '@/lib/types/cloudinary-admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminUserWithRole();

    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const permissions = ROLE_PERMISSIONS[admin.role] || {};

    return NextResponse.json({ success: true, data: { user: admin, permissions } });
  } catch (error: any) {
    console.error('Error fetching admin permissions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
