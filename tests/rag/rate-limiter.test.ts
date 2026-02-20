import { describe, it, expect } from 'bun:test';
import { checkRateLimit, rateLimitKey, _expireKeyForTesting } from '../../src/lib/rag/rate-limiter';

const MAX = 20;

describe('checkRateLimit', () => {
  it('allows requests up to the limit', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < MAX; i++) {
      const result = checkRateLimit(key);
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks the request after the limit is exceeded', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < MAX; i++) checkRateLimit(key);
    const result = checkRateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('resets after the window expires', () => {
    const key = `test:${Math.random()}`;
    for (let i = 0; i < MAX; i++) checkRateLimit(key);
    expect(checkRateLimit(key).allowed).toBe(false);
    _expireKeyForTesting(key);
    expect(checkRateLimit(key).allowed).toBe(true);
  });

  it('remaining decreases with each request', () => {
    const key = `test:${Math.random()}`;
    const first = checkRateLimit(key);
    const second = checkRateLimit(key);
    expect(second.remaining).toBeLessThan(first.remaining);
  });
});

describe('rateLimitKey', () => {
  it('returns a user-based key when userId is provided', () => {
    const key = rateLimitKey('user-abc', '1.2.3.4');
    expect(key).toBe('user:user-abc');
  });

  it('returns an IP-based key when userId is undefined', () => {
    const key = rateLimitKey(undefined, '1.2.3.4');
    expect(key).toBe('ip:1.2.3.4');
  });

  it('returns ip:unknown when both are undefined', () => {
    const key = rateLimitKey(undefined, undefined);
    expect(key).toBe('ip:unknown');
  });
});
