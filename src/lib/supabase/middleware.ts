import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/provider', '/renter', '/admin', '/profile', '/settings', '/bookings', '/equipment/new', '/messages'];
  const authRoutes = ['/login', '/verify'];
  const setupRoutes = ['/phone-setup', '/onboarding'];
  
  const pathname = request.nextUrl.pathname;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isSetupRoute = setupRoutes.some(route => pathname.startsWith(route));

  // For authenticated users, check if they need to complete phone setup
  if (user && !isSetupRoute && !isAuthRoute) {
    // Check if user has phone number
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('phone, is_profile_complete')
      .eq('id', user.id)
      .single();

    // Redirect to phone setup if no phone number
    if (!profile?.phone && pathname !== '/phone-setup') {
      const url = request.nextUrl.clone();
      url.pathname = '/phone-setup';
      return NextResponse.redirect(url);
    }

    // Redirect to onboarding if profile is not complete (but has phone)
    if (profile?.phone && !profile?.is_profile_complete && pathname !== '/onboarding' && !isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  // Allow setup routes for authenticated users
  if (isSetupRoute && user) {
    return supabaseResponse;
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    url.pathname = redirect;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
