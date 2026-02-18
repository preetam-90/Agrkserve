/**
 * POST /api/chat/media/delete
 *
 * Deletes one or more temporary chat media files from Cloudinary.
 *
 * Called in two scenarios:
 *   1. User starts a new chat session (explicit fetch call)
 *   2. User leaves/closes the chat page (navigator.sendBeacon call)
 *
 * - No authentication required (public IDs are the only access control)
 * - Uses Promise.allSettled so partial failures don't abort the batch
 * - Always returns 200 — deletion failures are logged but non-fatal
 *
 * @param body.mediaItems - Array of { publicId: string, type: 'image'|'video'|'document' }
 * @returns JSON { success: true, deleted: number, total: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

// Configure Cloudinary (uses server-side env vars — never exposed to client)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Shape of each item in the deletion request */
interface MediaDeleteItem {
  publicId: string;
  type: 'image' | 'video' | 'document';
}

/**
 * Deletes a single resource from Cloudinary by its public_id.
 *
 * Always resolves (never rejects) — a failed deletion is logged
 * and treated as non-fatal so other deletions can proceed.
 *
 * @param publicId   - Cloudinary public ID of the resource
 * @param resourceType - 'image' | 'video' | 'raw' (Cloudinary resource type)
 * @returns { publicId, success }
 */
async function safeDeleteResource(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw'
): Promise<{ publicId: string; success: boolean }> {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) {
        console.error(`[chat/media/delete] Failed to delete "${publicId}":`, error.message);
        resolve({ publicId, success: false });
      } else {
        const ok = result?.result === 'ok' || result?.result === 'not found';
        if (!ok) {
          console.warn(`[chat/media/delete] Unexpected result for "${publicId}":`, result?.result);
        }
        resolve({ publicId, success: ok });
      }
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body — supports both fetch() and navigator.sendBeacon() calls
    let body: { mediaItems?: MediaDeleteItem[] };
    try {
      body = await request.json();
    } catch {
      // If body parsing fails (e.g., empty beacon), return success gracefully
      return NextResponse.json({ success: true, deleted: 0, total: 0 });
    }

    const { mediaItems } = body;

    // Nothing to delete — return early
    if (!mediaItems || !Array.isArray(mediaItems) || mediaItems.length === 0) {
      return NextResponse.json({ success: true, deleted: 0, total: 0 });
    }

    // Map each item to its Cloudinary resource type and delete in parallel
    const deletePromises = mediaItems.map((item) => {
      const resourceType: 'image' | 'video' | 'raw' =
        item.type === 'image' ? 'image' : item.type === 'video' ? 'video' : 'raw';
      return safeDeleteResource(item.publicId, resourceType);
    });

    // Use allSettled so one failure doesn't abort the rest
    const results = await Promise.allSettled(deletePromises);

    const deleted = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;

    return NextResponse.json({
      success: true,
      deleted,
      total: mediaItems.length,
    });
  } catch (error) {
    console.error('[/api/chat/media/delete] Unexpected error:', error);
    // Return 200 even on error — cleanup failures should not surface as errors to client
    return NextResponse.json({ success: true, deleted: 0, total: 0 });
  }
}
