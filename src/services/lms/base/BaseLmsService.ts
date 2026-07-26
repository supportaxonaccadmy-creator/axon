import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { PaginatedResult } from '@/types/database';
import type { SortOption } from '@/lib/helpers/sortingHelper';

export interface LmsServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface LmsListResult<T> {
  data: T[];
  error: string | null;
}

export interface LmsFilter {
  column: string;
  value: unknown;
}

export interface LmsListOptions {
  publishedOnly?: boolean | undefined;
  sort?: SortOption | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
  search?: string | undefined;
  searchColumn?: string | undefined;
  filters?: LmsFilter[] | undefined;
}

export abstract class BaseLmsService<T, TInsert, TUpdate, TRow> {
  protected abstract tableName: string;
  protected abstract serviceName: string;
  protected abstract mapRow(row: TRow): T;
  protected abstract toInsertRow(input: TInsert): Record<string, unknown>;
  protected abstract toUpdateRow(input: TUpdate): Record<string, unknown>;
  protected abstract slugColumn: string;
  protected parentIdColumn: string | null = null;
  protected defaultSort: SortOption = { column: 'sort_order', direction: 'asc' };

  protected get client() {
    return getSupabaseClient();
  }

  protected logError(method: string, error: string): void {
    logger.error(`${this.serviceName}.${method}`, { error });
  }

  async getById(id: string): Promise<LmsServiceResult<T>> {
    const { data, error } = await this.client.from(this.tableName).select('*').eq('id', id).maybeSingle();
    if (error) { this.logError('getById', error.message); return { data: null, error: error.message }; }
    return { data: data ? this.mapRow(data as TRow) : null, error: null };
  }

  async getBySlug(slug: string, parentId?: string): Promise<LmsServiceResult<T>> {
    let query = this.client.from(this.tableName).select('*').eq(this.slugColumn, slug);
    if (this.parentIdColumn && parentId) {
      query = query.eq(this.parentIdColumn, parentId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) { this.logError('getBySlug', error.message); return { data: null, error: error.message }; }
    return { data: data ? this.mapRow(data as TRow) : null, error: null };
  }

  async list(options?: LmsListOptions): Promise<LmsListResult<T>> {
    let query = this.client.from(this.tableName).select('*');
    query = this.applyFilters(query, options);
    query = this.applySearch(query, options);
    query = this.applySort(query, options);
    const { data, error } = await query;
    if (error) { this.logError('list', error.message); return { data: [], error: error.message }; }
    return { data: (data as TRow[]).map((r) => this.mapRow(r)), error: null };
  }

  async paginate(page: number = 1, pageSize: number = 10, options?: LmsListOptions): Promise<PaginatedResult<T>> {
    let countQuery = this.client.from(this.tableName).select('*', { count: 'exact', head: true });
    countQuery = this.applyFilters(countQuery, options);
    countQuery = this.applySearch(countQuery, options);
    const { count, error: countError } = await countQuery;
    if (countError) this.logError('paginate count', countError.message);
    const total = count ?? 0;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    let query = this.client.from(this.tableName).select('*');
    query = this.applyFilters(query, options);
    query = this.applySearch(query, options);
    query = this.applySort(query, options);
    query = query.range(offset, offset + pageSize - 1);
    const { data, error } = await query;
    if (error) { this.logError('paginate', error.message); return { data: [], total: 0, page, pageSize, totalPages: 0, hasNext: false, hasPrev: false }; }
    return { data: (data as TRow[]).map((r) => this.mapRow(r)), total, page, pageSize, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  }

  async create(input: TInsert): Promise<LmsServiceResult<T>> {
    const { data, error } = await this.client.from(this.tableName).insert(this.toInsertRow(input)).select('*').maybeSingle();
    if (error) { this.logError('create', error.message); return { data: null, error: error.message }; }
    return { data: data ? this.mapRow(data as TRow) : null, error: null };
  }

  async update(id: string, input: TUpdate): Promise<LmsServiceResult<T>> {
    const { data, error } = await this.client.from(this.tableName).update(this.toUpdateRow(input)).eq('id', id).select('*').maybeSingle();
    if (error) { this.logError('update', error.message); return { data: null, error: error.message }; }
    return { data: data ? this.mapRow(data as TRow) : null, error: null };
  }

  async remove(id: string): Promise<{ error: string | null }> {
    const { error } = await this.client.from(this.tableName).delete().eq('id', id);
    if (error) { this.logError('remove', error.message); return { error: error.message }; }
    return { error: null };
  }

  async count(filters?: LmsFilter[]): Promise<number> {
    let query = this.client.from(this.tableName).select('*', { count: 'exact', head: true });
    if (filters) {
      for (const f of filters) {
        query = query.eq(f.column, f.value);
      }
    }
    const { count, error } = await query;
    if (error) this.logError('count', error.message);
    return count ?? 0;
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await this.client.from(this.tableName).select('id').eq('id', id).maybeSingle();
    if (error) { this.logError('exists', error.message); return false; }
    return data !== null;
  }

  async existsBySlug(slug: string, parentId?: string): Promise<boolean> {
    let query = this.client.from(this.tableName).select('id').eq(this.slugColumn, slug);
    if (this.parentIdColumn && parentId) {
      query = query.eq(this.parentIdColumn, parentId);
    }
    const { data, error } = await query.maybeSingle();
    if (error) { this.logError('existsBySlug', error.message); return false; }
    return data !== null;
  }

  async publish(id: string): Promise<LmsServiceResult<T>> {
    return this.update(id, { status: 'published' } as unknown as TUpdate);
  }

  async unpublish(id: string): Promise<LmsServiceResult<T>> {
    return this.update(id, { status: 'draft' } as unknown as TUpdate);
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<LmsServiceResult<T>> {
    return this.update(id, { sortOrder } as unknown as TUpdate);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected applyFilters(query: any, options?: LmsListOptions): any {
    let q = query;
    if (options?.publishedOnly) q = q.eq('status', 'published');
    if (options?.filters) {
      for (const f of options.filters) {
        q = q.eq(f.column, f.value);
      }
    }
    return q;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected applySearch(query: any, options?: LmsListOptions): any {
    if (options?.search) {
      const col = options.searchColumn ?? 'title';
      return query.ilike(col, `%${options.search}%`);
    }
    return query;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected applySort(query: any, options?: LmsListOptions): any {
    const sort = options?.sort ?? this.defaultSort;
    return query.order(sort.column, { ascending: sort.direction === 'asc' });
  }
}
