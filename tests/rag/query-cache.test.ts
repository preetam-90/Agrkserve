import { describe, it, expect, beforeEach } from 'bun:test';
import { LRUCache, makeQueryCacheKey } from '../../src/lib/rag/query-cache';

describe('LRUCache', () => {
  let cache: LRUCache<string>;

  beforeEach(() => {
    cache = new LRUCache<string>(3, 60_000);
  });

  it('stores and retrieves a value', () => {
    cache.set('a', 'alpha');
    expect(cache.get('a')).toBe('alpha');
  });

  it('returns null for missing key', () => {
    expect(cache.get('missing')).toBeNull();
  });

  it('evicts LRU entry when capacity is exceeded', () => {
    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    cache.set('c', 'gamma');
    cache.get('a');
    cache.set('d', 'delta');
    expect(cache.get('b')).toBeNull();
  });

  it('expires entries after TTL', async () => {
    const shortTtl = new LRUCache<string>(10, 10);
    shortTtl.set('x', 'val');
    await new Promise((r) => setTimeout(r, 20));
    expect(shortTtl.get('x')).toBeNull();
  });

  it('tracks hit and miss counts in stats', () => {
    cache.set('k', 'v');
    cache.get('k');
    cache.get('nope');
    const stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
  });

  it('reports hit rate as 0.00% when no accesses', () => {
    const stats = cache.stats();
    expect(stats.hitRate).toBe('0.00%');
  });

  it('clear() resets size and stats', () => {
    cache.set('a', 'alpha');
    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.stats().hits).toBe(0);
  });
});

describe('makeQueryCacheKey', () => {
  it('normalises whitespace in query', () => {
    const a = makeQueryCacheKey('search', 'u1', 'hello  world');
    const b = makeQueryCacheKey('search', 'u1', 'hello world');
    expect(a).toBe(b);
  });

  it('uses "guest" when userId is null', () => {
    const key = makeQueryCacheKey('list', null, 'query');
    expect(key).toContain('guest');
  });

  it('includes intentType and userId', () => {
    const key = makeQueryCacheKey('vector_search', 'user-42', 'tractor');
    expect(key).toContain('vector_search');
    expect(key).toContain('user-42');
  });
});
