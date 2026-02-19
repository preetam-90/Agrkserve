import { NextResponse } from 'next/server';
import {
  syncAllKnowledge,
  syncEquipment,
  syncUsers,
  syncLabour,
  syncReviews,
  syncBookings,
} from '@/lib/services/knowledge-service';

export const maxDuration = 300;

type SyncType = 'equipment' | 'users' | 'labour' | 'reviews' | 'bookings' | 'all';

function isValidSyncType(type: unknown): type is SyncType {
  return (
    typeof type === 'string' &&
    ['equipment', 'users', 'labour', 'reviews', 'bookings', 'all'].includes(type)
  );
}

function authorize(request: Request): boolean {
  const adminKey = request.headers.get('x-admin-key');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) return false;
  return adminKey === serviceRoleKey;
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'knowledge-sync',
    timestamp: new Date().toISOString(),
    availableTypes: ['equipment', 'users', 'labour', 'reviews', 'bookings', 'all'],
  });
}

export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid or missing x-admin-key header' },
      { status: 401 }
    );
  }

  try {
    let type: SyncType = 'all';
    let since: Date | undefined;

    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const body = await request.json().catch(() => ({}));

      if (body.type !== undefined) {
        if (!isValidSyncType(body.type)) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid sync type: "${body.type}". Must be one of: equipment, users, labour, reviews, bookings, all`,
            },
            { status: 400 }
          );
        }
        type = body.type;
      }

      if (body.since !== undefined) {
        const parsed = new Date(body.since);
        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid "since" date: "${body.since}". Must be a valid ISO date string`,
            },
            { status: 400 }
          );
        }
        since = parsed;
      }
    }

    let results: Record<string, { synced: number; errors: string[] }>;

    if (type === 'all') {
      if (since) {
        const [equipment, users, labour, reviews, bookings] = await Promise.all([
          syncEquipment(since),
          syncUsers(since),
          syncLabour(since),
          syncReviews(since),
          syncBookings(since),
        ]);
        results = { equipment, users, labour, reviews, bookings };
      } else {
        results = await syncAllKnowledge();
      }
    } else {
      const syncFn = {
        equipment: syncEquipment,
        users: syncUsers,
        labour: syncLabour,
        reviews: syncReviews,
        bookings: syncBookings,
      }[type];

      const result = await syncFn(since);
      results = { [type]: result };
    }

    const hasErrors = Object.values(results).some((r) => r.errors.length > 0);

    return NextResponse.json({
      success: !hasErrors,
      type,
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Knowledge sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during sync',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
