import { getSupabaseClient } from '@/lib/supabase';
import type { QueryOptions, PaginatedResult, FilterCondition } from '@/types/database';
import { databaseConfig } from '@/config/database';
import { logger } from '@/lib/logger';

class DatabaseClient {
  from(table: string) {
    return getSupabaseClient().from(table);
  }

  async select<T>(table: string, options?: QueryOptions): Promise<{ data: T[] | null; error: string | null }> {
    let query = getSupabaseClient().from(table).select(options?.select ?? '*');

    if (options?.count) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = (query as any).count(options.count);
    }

    if (options?.filters) {
      for (const filter of options.filters) {
        query = this.applyFilter(query, filter);
      }
    }

    if (options?.order) {
      for (const ord of options.order) {
        query = query.order(ord.column, { ascending: ord.order === 'asc' });
      }
    }

    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    if (options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + (options.limit ?? databaseConfig.defaultPageSize) - 1);
    }

    if (options?.single) {
      const { data, error } = await query.maybeSingle();
      return { data: data ? [data as T] : null, error: error?.message ?? null };
    }

    const { data, error } = await query;
    return { data: data as T[] | null, error: error?.message ?? null };
  }

  async insert<T>(table: string, values: T | T[]): Promise<{ data: T[] | null; error: string | null }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await getSupabaseClient().from(table).insert(values as any).select();
    return { data: data as T[] | null, error: error?.message ?? null };
  }

  async update<T>(
    table: string,
    values: Partial<T>,
    filters: { column: string; value: unknown }[],
  ): Promise<{ data: T[] | null; error: string | null }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = getSupabaseClient().from(table).update(values as any);
    for (const filter of filters) {
      query = query.eq(filter.column, filter.value);
    }
    const { data, error } = await query.select();
    return { data: data as T[] | null, error: error?.message ?? null };
  }

  async delete<T>(
    table: string,
    filters: { column: string; value: unknown }[],
  ): Promise<{ data: T[] | null; error: string | null }> {
    let query = getSupabaseClient().from(table).delete();
    for (const filter of filters) {
      query = query.eq(filter.column, filter.value);
    }
    const { data, error } = await query.select();
    return { data: data as T[] | null, error: error?.message ?? null };
  }

  async count(table: string, filters?: { column: string; value: unknown }[]): Promise<number> {
    let query = getSupabaseClient().from(table).select('*', { count: 'exact', head: true });
    if (filters) {
      for (const filter of filters) {
        query = query.eq(filter.column, filter.value);
      }
    }
    const { count, error } = await query;
    if (error) {
      logger.error('Database count error', { table, error: error.message });
      return 0;
    }
    return count ?? 0;
  }

  async paginate<T>(
    table: string,
    page: number,
    pageSize: number,
    options?: QueryOptions,
  ): Promise<PaginatedResult<T>> {
    const currentPage = Math.max(1, page);
    const currentPageSize = Math.min(Math.max(1, pageSize), databaseConfig.maxPageSize);
    const offset = (currentPage - 1) * currentPageSize;

    const total = await this.count(table, options?.filters?.map((f) => ({ column: f.column, value: f.value })));
    const totalPages = Math.ceil(total / currentPageSize) || 1;

    const { data, error } = await this.select<T>(table, {
      ...options,
      limit: currentPageSize,
      offset,
    });

    if (error) {
      logger.error('Database paginate error', { table, error });
    }

    return {
      data: data ?? [],
      total,
      page: currentPage,
      pageSize: currentPageSize,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilter(query: any, filter: FilterCondition): any {
    const { column, operator, value } = filter;
    switch (operator) {
      case 'eq':
        return query.eq(column, value);
      case 'neq':
        return query.neq(column, value);
      case 'gt':
        return query.gt(column, value);
      case 'gte':
        return query.gte(column, value);
      case 'lt':
        return query.lt(column, value);
      case 'lte':
        return query.lte(column, value);
      case 'like':
        return query.like(column, String(value));
      case 'ilike':
        return query.ilike(column, String(value));
      case 'is':
        return query.is(column, value);
      case 'in':
        return query.in(column, value as unknown[]);
      case 'contains':
        return query.contains(column, value);
      case 'range':
        return query.range(column, value as [number, number]);
      default:
        return query;
    }
  }
}

export const databaseClient = new DatabaseClient();
export { DatabaseClient };
