import type { CacheEntry, CacheStrategy } from './pwa.types';

const DEFAULT_TTL = 5 * 60 * 1000;
const MAX_ENTRIES = 200;
const CACHE_PREFIX = 'lms_cache_';

class CacheManager {
  private memoryCache = new Map<string, CacheEntry>();
  private listeners = new Set<() => void>();

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = CACHE_PREFIX + key;
    const memEntry = this.memoryCache.get(fullKey);
    if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttl) {
      return memEntry.data as T;
    }
    if (memEntry) {
      this.memoryCache.delete(fullKey);
    }
    try {
      const stored = localStorage.getItem(fullKey);
      if (!stored) return null;
      const entry: CacheEntry<T> = JSON.parse(stored);
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(fullKey);
        return null;
      }
      this.memoryCache.set(fullKey, entry as CacheEntry);
      return entry.data;
    } catch {
      return null;
    }
  }

  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    const fullKey = CACHE_PREFIX + key;
    const entry: CacheEntry<T> = { key: fullKey, data, timestamp: Date.now(), ttl, version: '1' };
    this.memoryCache.set(fullKey, entry as CacheEntry);
    try {
      localStorage.setItem(fullKey, JSON.stringify(entry));
    } catch {
      if (this.memoryCache.size > MAX_ENTRIES) this.evictOldest();
    }
    this.notify();
  }

  invalidate(key: string): void {
    const fullKey = CACHE_PREFIX + key;
    this.memoryCache.delete(fullKey);
    try { localStorage.removeItem(fullKey); } catch { /* ignore */ }
    this.notify();
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of Array.from(this.memoryCache.keys())) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
        try { localStorage.removeItem(key); } catch { /* ignore */ }
      }
    }
    this.notify();
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key);
      });
    } catch { /* ignore */ }
    this.notify();
  }

  getStats(): { totalEntries: number; memoryEntries: number; storageSize: number } {
    let storageSize = 0;
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          const val = localStorage.getItem(key);
          if (val) storageSize += val.length;
        }
      });
    } catch { /* ignore */ }
    return { totalEntries: this.memoryCache.size, memoryEntries: this.memoryCache.size, storageSize };
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [key, entry] of this.memoryCache) {
      if (entry.timestamp < oldestTime) { oldestTime = entry.timestamp; oldestKey = key; }
    }
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      try { localStorage.removeItem(oldestKey); } catch { /* ignore */ }
    }
  }

  strategy<T>(strategy: CacheStrategy, key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    switch (strategy) {
      case 'cache-first':
        return this.cacheFirst(key, fetcher, ttl);
      case 'network-first':
        return this.networkFirst(key, fetcher, ttl);
      case 'stale-while-revalidate':
        return this.staleWhileRevalidate(key, fetcher, ttl);
    }
  }

  private async cacheFirst<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  private async networkFirst<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      const data = await fetcher();
      this.set(key, data, ttl);
      return data;
    } catch {
      const cached = await this.get<T>(key);
      if (cached !== null) return cached;
      throw new Error('Network failed and no cache available');
    }
  }

  private async staleWhileRevalidate<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    const fetchPromise = fetcher().then((data) => { this.set(key, data, ttl); return data; }).catch(() => cached as T);
    return cached ?? (await fetchPromise);
  }
}

export const cacheService = new CacheManager();
