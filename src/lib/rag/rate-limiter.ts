const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.count, retryAfterMs: 0 };
}

export function rateLimitKey(userId: string | undefined, ip: string | undefined): string {
  return userId ? `user:${userId}` : `ip:${ip ?? 'unknown'}`;
}

export function _expireKeyForTesting(key: string): void {
  const entry = store.get(key);
  if (entry) entry.windowStart = 0;
}
