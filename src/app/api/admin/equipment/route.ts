import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * ITEMS_PER_PAGE;

    let query = supabase
      .from('equipment')
      .select('*, owner:user_profiles!owner_id(name, email, phone)', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching equipment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch stats
    const { data: allEquipment, error: statsError } = await supabase
      .from('equipment')
      .select('is_available, price_per_day');

    if (statsError) {
      console.error('Error fetching equipment stats:', statsError);
    }

    const stats = {
      totalAssets: count || 0,
      availableCount: allEquipment?.filter((e) => e.is_available).length || 0,
      rentedCount: allEquipment?.filter((e) => !e.is_available).length || 0,
      totalValue: allEquipment?.reduce((sum, e) => sum + (e.price_per_day || 0), 0) || 0,
    };

    return NextResponse.json({ 
      data, 
      count, 
      page, 
      totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
      stats 
    });
  } catch (error) {
    console.error('Error in admin equipment API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Equipment ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting equipment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin equipment DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}