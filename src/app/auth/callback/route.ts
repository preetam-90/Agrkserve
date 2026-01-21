import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    if (data.user) {
      // Check if user has a profile with phone number
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('phone, is_profile_complete')
        .eq('id', data.user.id)
        .single();

      // Extract phone from Google if available
      const googlePhone = data.user.user_metadata?.phone || 
                         data.user.user_metadata?.phone_number;

      // Update last login
      try {
        await supabase.rpc('update_last_login', { user_id: data.user.id });
      } catch (error) {
        console.error('Failed to update last login:', error);
      }

      // If no phone number in profile, redirect to phone setup
      if (!profile?.phone && !googlePhone) {
        return NextResponse.redirect(`${origin}/phone-setup`);
      }

      // If Google provided phone but not in profile, save it
      if (googlePhone && !profile?.phone) {
        await supabase
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            phone: googlePhone,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            profile_image: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture,
            updated_at: new Date().toISOString()
          });
      }

      // If profile is not complete, go to onboarding
      if (!profile?.is_profile_complete) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Otherwise go to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Default redirect
  return NextResponse.redirect(`${origin}/onboarding`);
}
