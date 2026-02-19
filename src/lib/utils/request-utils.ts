import type { NextRequest } from 'next/server';

/**
 * Extracts metadata from a request for audit logging purposes.
 * Extracts IP address (from x-forwarded-for or x-real-ip headers) and user agent.
 */
export function extractRequestMetadata(request: NextRequest): {
  ipAddress: string;
  userAgent: string;
} {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ipAddress = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}
