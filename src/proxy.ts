import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  console.log('DEBUG: Proxy triggered for', request.nextUrl.pathname);
  try {
    const result = await updateSession(request);
    console.log('DEBUG: updateSession completed');
    return result;
  } catch (error) {
    console.error('DEBUG: Error in proxy:', error);
    throw error;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
