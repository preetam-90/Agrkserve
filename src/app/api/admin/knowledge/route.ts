import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { PlatformCategory } from '@/lib/services/platform-knowledge-service';
import {
  getPlatformKnowledge,
  upsertPlatformKnowledge,
  deletePlatformKnowledge,
} from '@/lib/services/platform-knowledge-service';
console.log('--- ADMIN KNOWLEDGE API MODULE LOADED ---');

async function requireAdmin(request: NextRequest): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('requireAdmin: Auth error:', authError);
  }

  if (!user) {
    console.log('requireAdmin: No user session found');
    return { ok: false };
  }

  console.log('requireAdmin: Found user:', user.id, user.email);

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (rolesError) {
    console.error('requireAdmin: Roles query error:', rolesError);
  }

  const isAdmin = roles?.some((r: { role: string }) => r.role === 'admin') ?? false;
  console.log('requireAdmin: Roles found:', roles?.map(r => r.role), 'isAdmin:', isAdmin);

  return { ok: isAdmin };
}

// GET — list platform_knowledge entries
export async function GET(request: NextRequest) {
  try {
    const { ok } = await requireAdmin(request);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') as PlatformCategory | undefined) || undefined;
    const key = searchParams.get('key') || undefined;

    const entries = await getPlatformKnowledge(category, key, false);
    return NextResponse.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST — create/update a platform_knowledge entry
export async function POST(request: NextRequest) {
  try {
    const { ok } = await requireAdmin(request);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { category, key, data, description, is_active, version } = body;

    if (!category || !key || !data) {
      return NextResponse.json({ error: 'Category, key, and data are required' }, { status: 400 });
    }

    const result = await upsertPlatformKnowledge({
      category,
      key,
      data,
      description,
      is_active,
      version,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('[API POST /api/admin/knowledge] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE — remove a platform_knowledge entry by category+key
export async function DELETE(request: NextRequest) {
  try {
    const { ok } = await requireAdmin(request);
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as PlatformCategory;
    const key = searchParams.get('key');

    if (!category || !key) {
      return NextResponse.json({ error: 'Category and key are required' }, { status: 400 });
    }

    const result = await deletePlatformKnowledge(category, key);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
