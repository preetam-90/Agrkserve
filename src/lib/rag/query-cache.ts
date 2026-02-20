interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hitCount: number;
}

export class LRUCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();
  private hits = 0;
  private misses = 0;

  constructor(
    private readonly maxSize: number,
    private readonly ttlMs: number
  ) {}

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    entry.hitCount++;
    this.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, timestamp: Date.now(), hitCount: 0 });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  size(): number {
    return this.cache.size;
  }

  stats(): { size: number; hits: number; misses: number; hitRate: string } {
    const total = this.hits + this.misses;
    const hitRate = total === 0 ? '0.00%' : `${((this.hits / total) * 100).toFixed(2)}%`;
    return { size: this.cache.size, hits: this.hits, misses: this.misses, hitRate };
  }
}

function normalizeKey(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function makeQueryCacheKey(
  intentType: string,
  userId: string | null,
  query: string
): string {
  return `${intentType}:${userId ?? 'guest'}:${normalizeKey(query)}`;
}

export const embeddingCache = new LRUCache<number[]>(200, 5 * 60 * 1000);
export const queryResultCache = new LRUCache<unknown>(100, 2 * 60 * 1000);
export const userProfileCache = new LRUCache<Record<string, unknown>>(500, 1 * 60 * 1000);
