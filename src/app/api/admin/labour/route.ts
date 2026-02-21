import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ITEMS_PER_PAGE = 10;

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    
    const search = searchParams.get('search') || '';
    const availability = searchParams.get('availability') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * ITEMS_PER_PAGE;

    let query = supabase
      .from('labour_profiles')
      .select('*, user:user_profiles!user_id(name, email, phone, profile_image)', { count: 'exact' });

    if (availability) {
      query = query.eq('availability', availability);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching labour profiles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Client-side search filtering (since we can't easily search joined tables)
    let filteredData = data || [];
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter((profile) => {
        const userName = profile.user?.name?.toLowerCase() || '';
        const userEmail = profile.user?.email?.toLowerCase() || '';
        const userPhone = profile.user?.phone?.toLowerCase() || '';
        const skills = profile.skills?.join(' ').toLowerCase() || '';
        const experienceYears = profile.experience_years?.toString() || '';

        return (
          userName.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          userPhone.includes(searchLower) ||
          skills.includes(searchLower) ||
          experienceYears.includes(searchLower)
        );
      });
    }

    return NextResponse.json({ 
      data: filteredData, 
      count: search ? filteredData.length : count, 
      page, 
      totalPages: Math.ceil(((search ? filteredData.length : count) || 0) / ITEMS_PER_PAGE)
    });
  } catch (error) {
    console.error('Error in admin labour API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { profileId, isVerified } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('labour_profiles')
      .update({ is_verified: isVerified })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating labour profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in admin labour PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}