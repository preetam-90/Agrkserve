/**
 * Cloudinary Admin Service
 * Secure server-side operations for Cloudinary media management
 * NEVER expose API_SECRET to frontend
 */

import { v2 as cloudinary } from 'cloudinary';
import type {
  CloudinaryAsset,
  CloudinaryAssetWithUser,
  CloudinarySearchResponse,
  CloudinaryUsageResponse,
  MediaFilters,
  MediaType,
  PaginatedMediaResponse,
  UserMediaSummary,
  MediaAnalytics,
} from '@/lib/types/cloudinary-admin';

// Ensure Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error('CLOUDINARY_CLOUD_NAME is not set');
}
if (!process.env.CLOUDINARY_API_KEY) {
  console.error('CLOUDINARY_API_KEY is not set');
}
if (!process.env.CLOUDINARY_API_SECRET) {
  console.error('CLOUDINARY_API_SECRET is not set');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING',
});

const MAX_RESULTS = 500;
const DEFAULT_PAGE_SIZE = 50;

/**
 * Parse public_id to extract user information based on folder structure
 * Expected structure: users/{userId}/{type}/{assetId}
 */
function parseAssetPath(publicId: string): {
  userId?: string;
  userPath?: 'equipment' | 'labour' | 'profile' | 'other';
  assetId?: string;
} {
  const parts = publicId.split('/');

  // Check if it follows the users/{userId}/{type}/{assetId} pattern
  if (parts.length >= 3 && parts[0] === 'users') {
    const userId = parts[1];
    const type = parts[2] as 'equipment' | 'labour' | 'profile';
    const assetId = parts.slice(3).join('/');

    if (['equipment', 'labour', 'profile'].includes(type)) {
      return { userId, userPath: type, assetId };
    }
    return { userId, userPath: 'other', assetId };
  }

  return {};
}

/**
 * Transform Cloudinary asset to include user information
 */
function transformAsset(asset: CloudinaryAsset): CloudinaryAssetWithUser {
  const pathInfo = parseAssetPath(asset.public_id);

  return {
    ...asset,
    ...pathInfo,
    status: 'active',
    thumbnail_url:
      asset.resource_type === 'video'
        ? cloudinary.url(asset.public_id, {
            resource_type: 'video',
            transformation: [{ width: 300, height: 200, crop: 'fill' }, { format: 'jpg' }],
          })
        : cloudinary.url(asset.public_id, {
            transformation: [{ width: 300, height: 200, crop: 'fill' }],
          }),
  };
}

/**
 * Search Cloudinary assets with filters
 */
export async function searchAssets(filters: MediaFilters = {}): Promise<PaginatedMediaResponse> {
  const {
    resourceType = 'all',
    folder,
    userId,
    dateFrom,
    dateTo,
    search,
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = filters;

  try {
    console.log('Cloudinary searchAssets called with filters:', filters);

    // Build search expression
    let expression = '';

    if (resourceType !== 'all') {
      expression += `resource_type:${resourceType}`;
    }

    if (folder) {
      expression += expression ? ` AND folder:${folder}` : `folder:${folder}`;
    }

    if (userId) {
      expression += expression ? ` AND public_id:users/${userId}/*` : `public_id:users/${userId}/*`;
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime() / 1000;
      expression += expression ? ` AND created_at>=${fromDate}` : `created_at>=${fromDate}`;
    }

    if (dateTo) {
      const toDate = new Date(dateTo).getTime() / 1000;
      expression += expression ? ` AND created_at<=${toDate}` : `created_at<=${toDate}`;
    }

    if (search) {
      expression += expression
        ? ` AND (public_id:*${search}* OR tags:*${search}*)`
        : `(public_id:*${search}* OR tags:*${search}*)`;
    }

    // If no expression, search for all images and videos
    if (!expression) {
      expression = 'resource_type:image OR resource_type:video';
    }

    console.log('Cloudinary search expression:', expression);

    const sortField = sortBy === 'created_at' ? 'created_at' : sortBy;
    const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const result = (await cloudinary.search
      .expression(expression)
      .sort_by(sortField, sortDirection)
      .max_results(Math.min(limit, MAX_RESULTS))
      .execute()) as CloudinarySearchResponse;

    console.log('Cloudinary search result:', {
      total_count: result.total_count,
      resources_count: result.resources?.length || 0,
    });

    const assets = result.resources.map(transformAsset);

    // Manual pagination since Cloudinary search doesn't support offset
    const total = result.total_count;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedAssets = assets.slice(startIndex, startIndex + limit);

    return {
      assets: paginatedAssets,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    console.error('Cloudinary search error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : String(error));
    throw new Error(
      `Failed to search Cloudinary assets: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get all assets by user ID
 */
export async function getAssetsByUser(userId: string): Promise<CloudinaryAssetWithUser[]> {
  try {
    const result = (await cloudinary.search
      .expression(`public_id:users/${userId}/*`)
      .sort_by('created_at', 'desc')
      .max_results(MAX_RESULTS)
      .execute()) as CloudinarySearchResponse;

    return result.resources.map(transformAsset);
  } catch (error) {
    console.error('Error fetching user assets:', error);
    throw new Error('Failed to fetch user assets');
  }
}

/**
 * Get user media summary
 */
export async function getUserMediaSummary(userId: string): Promise<UserMediaSummary> {
  const assets = await getAssetsByUser(userId);

  const imageCount = assets.filter((a) => a.resource_type === 'image').length;
  const videoCount = assets.filter((a) => a.resource_type === 'video').length;
  const equipmentAssets = assets.filter((a) => a.userPath === 'equipment').length;
  const labourAssets = assets.filter((a) => a.userPath === 'labour').length;
  const profileAssets = assets.filter((a) => a.userPath === 'profile').length;

  const totalStorageBytes = assets.reduce((sum, a) => sum + a.bytes, 0);

  const lastUpload =
    assets.length > 0
      ? assets.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]
      : null;

  return {
    userId,
    totalAssets: assets.length,
    totalStorageBytes,
    imageCount,
    videoCount,
    equipmentAssets,
    labourAssets,
    profileAssets,
    lastUploadAt: lastUpload?.created_at,
    assets,
  };
}

/**
 * Get all users with media
 */
export async function getAllUsersWithMedia(): Promise<UserMediaSummary[]> {
  try {
    // Search for all assets in users folder
    const result = (await cloudinary.search
      .expression('public_id:users/*')
      .sort_by('created_at', 'desc')
      .max_results(MAX_RESULTS)
      .execute()) as CloudinarySearchResponse;

    // Group by user
    const userMap = new Map<string, CloudinaryAssetWithUser[]>();

    result.resources.forEach((asset) => {
      const transformed = transformAsset(asset);
      if (transformed.userId) {
        if (!userMap.has(transformed.userId)) {
          userMap.set(transformed.userId, []);
        }
        userMap.get(transformed.userId)!.push(transformed);
      }
    });

    // Build summaries
    const summaries: UserMediaSummary[] = [];

    for (const [userId, assets] of userMap) {
      const imageCount = assets.filter((a) => a.resource_type === 'image').length;
      const videoCount = assets.filter((a) => a.resource_type === 'video').length;
      const equipmentAssets = assets.filter((a) => a.userPath === 'equipment').length;
      const labourAssets = assets.filter((a) => a.userPath === 'labour').length;
      const profileAssets = assets.filter((a) => a.userPath === 'profile').length;

      const totalStorageBytes = assets.reduce((sum, a) => sum + a.bytes, 0);

      const lastUpload =
        assets.length > 0
          ? assets.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null;

      summaries.push({
        userId,
        totalAssets: assets.length,
        totalStorageBytes,
        imageCount,
        videoCount,
        equipmentAssets,
        labourAssets,
        profileAssets,
        lastUploadAt: lastUpload?.created_at,
        assets,
      });
    }

    return summaries.sort((a, b) => b.totalStorageBytes - a.totalStorageBytes);
  } catch (error) {
    console.error('Error fetching users with media:', error);
    throw new Error('Failed to fetch users with media');
  }
}

/**
 * Delete a single asset from Cloudinary
 */
export async function deleteAsset(
  publicId: string,
  resourceType: MediaType = 'image'
): Promise<void> {
  try {
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) {
          reject(error);
        } else if (result.result === 'ok' || result.result === 'not found') {
          resolve(result);
        } else {
          reject(new Error(`Delete failed: ${result.result}`));
        }
      });
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete asset from Cloudinary');
  }
}

/**
 * Delete multiple assets from Cloudinary
 */
export async function deleteMultipleAssets(
  publicIds: string[],
  resourceType: MediaType = 'image'
): Promise<{ deleted: string[]; failed: { publicId: string; error: string }[] }> {
  const deleted: string[] = [];
  const failed: { publicId: string; error: string }[] = [];

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;

  for (let i = 0; i < publicIds.length; i += batchSize) {
    const batch = publicIds.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (publicId) => {
        try {
          await deleteAsset(publicId, resourceType);
          deleted.push(publicId);
        } catch (error) {
          failed.push({
            publicId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })
    );

    // Small delay between batches
    if (i + batchSize < publicIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return { deleted, failed };
}

/**
 * Rename an asset in Cloudinary
 */
export async function renameAsset(
  publicId: string,
  newPublicId: string,
  resourceType: MediaType = 'image'
): Promise<void> {
  try {
    await new Promise((resolve, reject) => {
      cloudinary.uploader.rename(
        publicId,
        newPublicId,
        { resource_type: resourceType },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  } catch (error) {
    console.error('Cloudinary rename error:', error);
    throw new Error('Failed to rename asset');
  }
}

/**
 * Get Cloudinary usage analytics
 */
export async function getUsageAnalytics(): Promise<MediaAnalytics> {
  try {
    const usage = (await cloudinary.api.usage()) as CloudinaryUsageResponse;

    // Get asset counts by type
    const allAssets = (await cloudinary.search
      .expression('resource_type:image OR resource_type:video OR resource_type:raw')
      .max_results(0)
      .execute()) as CloudinarySearchResponse;

    const images = (await cloudinary.search
      .expression('resource_type:image')
      .max_results(0)
      .execute()) as CloudinarySearchResponse;

    const videos = (await cloudinary.search
      .expression('resource_type:video')
      .max_results(0)
      .execute()) as CloudinarySearchResponse;

    const raws = (await cloudinary.search
      .expression('resource_type:raw')
      .max_results(0)
      .execute()) as CloudinarySearchResponse;

    // Get storage by user
    const userSummaries = await getAllUsersWithMedia();
    const storageByUser = userSummaries.map((u) => ({
      userId: u.userId,
      userName: u.userName,
      totalBytes: u.totalStorageBytes,
      assetCount: u.totalAssets,
    }));

    // Generate monthly upload data (last 6 months)
    const monthlyUploads = await generateMonthlyUploadData();

    return {
      totalStorageBytes: usage.storage?.usage || 0,
      totalAssets: allAssets.total_count,
      imageCount: images.total_count,
      videoCount: videos.total_count,
      rawCount: raws.total_count,
      bandwidthUsed: usage.bandwidth?.usage,
      transformationsCount: usage.transformations?.usage,
      monthlyUploads,
      storageByUser,
    };
  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    throw new Error('Failed to fetch usage analytics');
  }
}

/**
 * Generate monthly upload data
 */
async function generateMonthlyUploadData() {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthName = date.toLocaleString('default', { month: 'short' });

    // Get uploads for this month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    try {
      const imagesResult = (await cloudinary.search
        .expression(
          `resource_type:image AND created_at>=${startTimestamp} AND created_at<=${endTimestamp}`
        )
        .max_results(0)
        .execute()) as CloudinarySearchResponse;

      const videosResult = (await cloudinary.search
        .expression(
          `resource_type:video AND created_at>=${startTimestamp} AND created_at<=${endTimestamp}`
        )
        .max_results(0)
        .execute()) as CloudinarySearchResponse;

      months.push({
        month: monthName,
        year,
        imageCount: imagesResult.total_count,
        videoCount: videosResult.total_count,
        totalBytes: 0, // Would need to calculate from actual resources
      });
    } catch {
      months.push({
        month: monthName,
        year,
        imageCount: 0,
        videoCount: 0,
        totalBytes: 0,
      });
    }
  }

  return months;
}

/**
 * Get asset details by public_id
 */
export async function getAssetDetails(publicId: string): Promise<CloudinaryAssetWithUser | null> {
  try {
    const result = await new Promise<CloudinaryAsset>((resolve, reject) => {
      cloudinary.api.resource(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as CloudinaryAsset);
        }
      });
    });

    return transformAsset(result);
  } catch (error) {
    console.error('Error fetching asset details:', error);
    return null;
  }
}

/**
 * Get folders from Cloudinary
 */
export async function getFolders(): Promise<string[]> {
  const result = await cloudinary.api.root_folders();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return result.folders.map((folder: any) => folder.name);
}

/**
 * Replace an existing asset with a new file
 */
export async function replaceAsset(
  publicId: string,
  file: File,
  resourceType: string = 'image'
): Promise<unknown> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType as 'image' | 'video' | 'raw',
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Disable asset delivery (soft disable)
 */
export async function disableAsset(publicId: string, resourceType: string = 'image'): Promise<unknown> {
  return await cloudinary.uploader.explicit(publicId, {
    type: 'upload',
    resource_type: resourceType as 'image' | 'video' | 'raw',
    access_control: [{ access_type: 'token' }],
  });
}

/**
 * Enable asset delivery (re-enable public access)
 */
export async function enableAsset(publicId: string, resourceType: string = 'image'): Promise<unknown> {
  return await cloudinary.uploader.explicit(publicId, {
    type: 'upload',
    resource_type: resourceType as 'image' | 'video' | 'raw',
    access_control: [{ access_type: 'anonymous' }],
  });
}
