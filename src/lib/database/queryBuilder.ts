import { getSupabaseClient } from '@/lib/supabase';
import type { QueryOptions, FilterCondition, OrderCondition } from '@/types/database';

class QueryBuilder<T> {
  private table: string;
  private selectColumns: string = '*';
  private filters: FilterCondition[] = [];
  private orders: OrderCondition[] = [];
  private limitCount: number | undefined;
  private offsetCount: number | undefined;
  private singleMode = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string): this {
    this.selectColumns = columns;
    return this;
  }

  filter(column: string, operator: FilterCondition['operator'], value: unknown): this {
    this.filters.push({ column, operator, value });
    return this;
  }

  orderBy(column: string, order: 'asc' | 'desc' = 'asc'): this {
    this.orders.push({ column, order });
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  offset(count: number): this {
    this.offsetCount = count;
    return this;
  }

  single(): this {
    this.singleMode = true;
    return this;
  }

  toOptions(): QueryOptions {
    return {
      select: this.selectColumns,
      filters: this.filters.length > 0 ? this.filters : undefined,
      order: this.orders.length > 0 ? this.orders : undefined,
      limit: this.limitCount,
      offset: this.offsetCount,
      single: this.singleMode,
    };
  }

  async execute(): Promise<{ data: T[] | null; error: string | null }> {
    let query = getSupabaseClient().from(this.table).select(this.selectColumns);

    for (const filter of this.filters) {
      query = this.applyFilter(query, filter);
    }

    for (const ord of this.orders) {
      query = query.order(ord.column, { ascending: ord.order === 'asc' });
    }

    if (this.limitCount !== undefined) {
      query = query.limit(this.limitCount);
    }

    if (this.offsetCount !== undefined) {
      query = query.range(this.offsetCount, this.offsetCount + (this.limitCount ?? 10) - 1);
    }

    if (this.singleMode) {
      const { data, error } = await query.maybeSingle();
      return { data: data ? [data as T] : null, error: error?.message ?? null };
    }

    const { data, error } = await query;
    return { data: data as T[] | null, error: error?.message ?? null };
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

export function createQuery<T>(table: string): QueryBuilder<T> {
  return new QueryBuilder<T>(table);
}

export { QueryBuilder };
