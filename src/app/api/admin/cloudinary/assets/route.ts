/**
 * GET /api/admin/cloudinary/assets
 * Search and list Cloudinary assets with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAssets, getAssetsByUser } from '@/lib/services/cloudinary-admin-service';
import { requirePermission } from '@/lib/utils/admin-rbac';
import { createMediaAuditLog, extractRequestMetadata } from '@/lib/services/media-audit-service';
import type { MediaFilters, MediaType, MediaStatus } from '@/lib/types/cloudinary-admin';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check permission
    const admin = await requirePermission('canViewMedia');

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const filters: MediaFilters = {
      resourceType: (searchParams.get('resourceType') as 'all' | MediaType | undefined) || 'all',
      folder: searchParams.get('folder') || undefined,
      userId: searchParams.get('userId') || undefined,
      status: (searchParams.get('status') as 'all' | MediaStatus | undefined) || 'all',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: Math.min(parseInt(searchParams.get('limit') || '50', 10), 100),
      sortBy:
        (searchParams.get('sortBy') as 'created_at' | 'bytes' | 'public_id' | undefined) ||
        'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'desc' | 'asc' | undefined) || 'desc',
    };

    // If userId is specified, get assets for that user
    let result;
    if (filters.userId) {
      const assets = await getAssetsByUser(filters.userId);
      const total = assets.length;
      const totalPages = Math.ceil(total / filters.limit!);
      const startIndex = ((filters.page || 1) - 1) * (filters.limit || 50);
      const paginatedAssets = assets.slice(startIndex, startIndex + (filters.limit || 50));

      result = {
        assets: paginatedAssets,
        total,
        page: filters.page || 1,
        limit: filters.limit || 50,
        totalPages,
        hasMore: (filters.page || 1) < totalPages,
      };
    } else {
      result = await searchAssets(filters);
    }

    // Log view action (non-blocking, silent failure)
    try {
      const { ipAddress, userAgent } = extractRequestMetadata(request);
      createMediaAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'view',
        publicId: 'list',
        assetType: 'image',
        details: { filters, totalResults: result.total },
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
  } catch (error) {
    console.error('Error fetching Cloudinary assets:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assets',
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}
