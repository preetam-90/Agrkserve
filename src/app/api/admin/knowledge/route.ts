import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { PlatformCategory } from '@/lib/services/platform-knowledge-service';
import { getPlatformKnowledge, upsertPlatformKnowledge } from '@/lib/services/platform-knowledge-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as PlatformCategory | undefined || undefined;
    const key = searchParams.get('key') || undefined;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const isAdmin = roles?.some((r: { role: string }) => r.role === 'admin');
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const entries = await getPlatformKnowledge(category, key, false);

    return NextResponse.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    console.error('Error fetching platform knowledge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true);

    const isAdmin = roles?.some((r: { role: string }) => r.role === 'admin');
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { category, key, data, description, is_active, version } = body;

    if (!category || !key || !data) {
      return NextResponse.json({ error: 'Category, key, and data are required' }, { status: 400 });
    }

    const result = await upsertPlatformKnowledge({ category, key, data, description, is_active, version });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error upserting platform knowledge:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
