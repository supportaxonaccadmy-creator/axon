import { getSupabaseClient } from '@/lib/supabase';
import { lmsCache, buildEntityCacheKey, buildListCacheKey, buildStatsCacheKey } from '@/lib/helpers/cacheHelper';
import { logger } from '@/lib/logger';
import type { HierarchyNode } from '@/services/lms/hierarchyService';
import { hierarchyService } from '@/services/lms/hierarchyService';

const HIERARCHY_CACHE_TTL = 10 * 60 * 1000;
const COUNT_CACHE_TTL = 2 * 60 * 1000;

const memoStore: Map<string, { value: unknown; timestamp: number }> = new Map();
const MEMO_TTL = 10 * 60 * 1000;

export const performanceOptimizer = {
  memoize<T>(key: string, factory: () => Promise<T>, ttlMs: number = MEMO_TTL): Promise<T> {
    const cached = memoStore.get(key);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return Promise.resolve(cached.value as T);
    }
    return factory().then((value) => {
      memoStore.set(key, { value, timestamp: Date.now() });
      return value;
    });
  },

  invalidateMemo(key: string): void {
    memoStore.delete(key);
  },

  invalidateAllMemos(): void {
    memoStore.clear();
  },

  async getCachedBatchTree(batchId: string, publishedOnly: boolean = false): Promise<{ data: HierarchyNode | null; error: string | null }> {
    const cacheKey = buildEntityCacheKey('batch-tree', `${batchId}-${publishedOnly}`);
    return lmsCache.getOrSet(
      cacheKey,
      async () => {
        const result = await hierarchyService.getBatchTree(batchId, publishedOnly);
        return result;
      },
      HIERARCHY_CACHE_TTL,
    );
  },

  async getCachedFullHierarchy(publishedOnly: boolean = false): Promise<{ data: HierarchyNode[]; error: string | null }> {
    const cacheKey = buildListCacheKey('full-hierarchy', { publishedOnly });
    return lmsCache.getOrSet(
      cacheKey,
      async () => {
        const result = await hierarchyService.getFullHierarchy(publishedOnly);
        return result;
      },
      HIERARCHY_CACHE_TTL,
    );
  },

  async getCachedCount(table: string, filters?: { column: string; value: unknown }[]): Promise<number> {
    const filterKey = filters ? filters.map((f) => `${f.column}=${f.value}`).join(',') : 'all';
    const cacheKey = buildStatsCacheKey(`${table}-count-${filterKey}`);
    return lmsCache.getOrSet(
      cacheKey,
      async () => {
        const supabase = getSupabaseClient();
        let query = supabase.from(table).select('id', { count: 'exact', head: true });
        if (filters) {
          for (const f of filters) {
            query = query.eq(f.column, f.value);
          }
        }
        const { count, error } = await query;
        if (error) logger.error('performanceOptimizer.getCachedCount', { error: error.message });
        return count ?? 0;
      },
      COUNT_CACHE_TTL,
    );
  },

  invalidateHierarchyCache(): void {
    lmsCache.invalidatePattern('lms:batch-tree:*');
    lmsCache.invalidatePattern('lms:full-hierarchy:*');
  },

  invalidateStatsCache(): void {
    lmsCache.invalidatePattern('lms:stats:*');
  },

  invalidateEntityCache(entity: string, id?: string): void {
    if (id) {
      lmsCache.invalidate(buildEntityCacheKey(entity, id));
    } else {
      lmsCache.invalidatePattern(`lms:${entity}:*`);
    }
  },

  async batchFetch<T>(table: string, ids: string[], select: string = '*'): Promise<{ data: T[]; error: string | null }> {
    if (ids.length === 0) return { data: [], error: null };
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from(table).select(select).in('id', ids);
    if (error) { logger.error('performanceOptimizer.batchFetch', { error: error.message }); return { data: [], error: error.message }; }
    return { data: (data ?? []) as T[], error: null };
  },

  async parallelFetch<T>(promises: Promise<T>[]): Promise<T[]> {
    return Promise.all(promises);
  },

  getCacheStats(): { total: number; expired: number; memoSize: number } {
    return { ...lmsCache.stats(), memoSize: memoStore.size };
  },

  cleanupAll(): void {
    lmsCache.cleanup();
    memoStore.clear();
  },
};

export function createLazyLoader<T>(loader: () => Promise<T>): { get: () => Promise<T>; reset: () => void; isLoaded: () => boolean } {
  let loaded: T | null = null;
  let loading: Promise<T> | null = null;
  return {
    get: (): Promise<T> => {
      if (loaded !== null) return Promise.resolve(loaded);
      if (loading) return loading;
      loading = loader().then((result) => {
        loaded = result;
        loading = null;
        return result;
      });
      return loading;
    },
    reset: (): void => {
      loaded = null;
      loading = null;
    },
    isLoaded: (): boolean => loaded !== null,
  };
}
