import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * ITEMS_PER_PAGE;

    let query = supabase
      .from('user_profiles')
      .select('*, user_roles(role, is_active)', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, page, totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE) });
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { userId, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_roles')
      .update({ is_active: isActive })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin users PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}