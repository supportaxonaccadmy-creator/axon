import { logger } from '@/lib/logger';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

class LmsCache {
  private store: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtl: number;

  constructor(defaultTtlMs: number = 5 * 60 * 1000) {
    this.defaultTtl = defaultTtlMs;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    const ttl = ttlMs ?? this.defaultTtl;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  invalidateAll(): void {
    this.store.clear();
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }

  refresh<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<T> {
    this.invalidate(key);
    return this.getOrSet(key, factory, ttlMs);
  }

  size(): number {
    return this.store.size;
  }

  stats(): { total: number; expired: number } {
    let expired = 0;
    const now = Date.now();
    for (const entry of this.store.values()) {
      if (now > entry.expiresAt) expired += 1;
    }
    return { total: this.store.size, expired };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
    logger.debug('LmsCache cleanup', { remaining: this.store.size });
  }
}

export const lmsCache = new LmsCache();

export function buildCacheKey(...parts: string[]): string {
  return parts.join(':');
}

export function buildEntityCacheKey(entity: string, id: string): string {
  return buildCacheKey('lms', entity, 'id', id);
}

export function buildListCacheKey(entity: string, options?: Record<string, unknown>): string {
  const opts = options ? JSON.stringify(options) : 'all';
  return buildCacheKey('lms', entity, 'list', opts);
}

export function buildSlugCacheKey(entity: string, slug: string): string {
  return buildCacheKey('lms', entity, 'slug', slug);
}

export function buildStatsCacheKey(entity: string): string {
  return buildCacheKey('lms', 'stats', entity);
}

export { LmsCache };
