import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { skills, experience_years, daily_rate, hourly_rate, bio } = body;

    // Validate required fields
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ error: 'At least one skill is required' }, { status: 400 });
    }

    if (!daily_rate || daily_rate <= 0) {
      return NextResponse.json({ error: 'Valid daily rate is required' }, { status: 400 });
    }

    // Get user profile for location data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('latitude, longitude, address')
      .eq('id', user.id)
      .single();

    // Check if labour profile already exists
    const { data: existingProfile } = await supabase
      .from('labour_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('labour_profiles')
        .update({
          skills,
          experience_years: experience_years || 0,
          daily_rate,
          hourly_rate: hourly_rate || null,
          bio: bio || '',
          availability: 'available',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating labour profile:', updateError);
        return NextResponse.json({ error: 'Failed to update labour profile' }, { status: 500 });
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase.from('labour_profiles').insert({
        user_id: user.id,
        skills,
        experience_years: experience_years || 0,
        daily_rate,
        hourly_rate: hourly_rate || null,
        bio: bio || '',
        availability: 'available',
        latitude: profile?.latitude || null,
        longitude: profile?.longitude || null,
        location_name: profile?.address || '',
      });

      if (insertError) {
        console.error('Error creating labour profile:', insertError);
        return NextResponse.json({ error: 'Failed to create labour profile' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Labour profile created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/labour/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

 
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('labour_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return NextResponse.json({ profile: null });
      }
      console.error('Error fetching labour profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in GET /api/labour/profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
