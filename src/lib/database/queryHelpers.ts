import { databaseClient } from './databaseClient';
import type { PaginatedResult, QueryOptions } from '@/types/database';
import { databaseConfig } from '@/config/database';

export async function paginate<T>(
  table: string,
  page: number = databaseConfig.defaultPage,
  pageSize: number = databaseConfig.defaultPageSize,
  options?: QueryOptions,
): Promise<PaginatedResult<T>> {
  return databaseClient.paginate<T>(table, page, pageSize, options);
}

export async function selectOne<T>(table: string, filters: { column: string; value: unknown }[]): Promise<{ data: T | null; error: string | null }> {
  let query = databaseClient.from(table).select('*');
  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }
  const { data, error } = await query.maybeSingle();
  return { data: data as T | null, error: error?.message ?? null };
}

export async function selectAll<T>(table: string, options?: QueryOptions): Promise<{ data: T[] | null; error: string | null }> {
  return databaseClient.select<T>(table, options);
}

export async function insertOne<T>(table: string, values: T): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await databaseClient.insert<T>(table, values);
  return { data: data && data.length > 0 ? data[0] ?? null : null, error };
}

export async function updateOne<T>(
  table: string,
  values: Partial<T>,
  filters: { column: string; value: unknown }[],
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await databaseClient.update<T>(table, values, filters);
  return { data: data && data.length > 0 ? data[0] ?? null : null, error };
}

export async function deleteOne<T>(
  table: string,
  filters: { column: string; value: unknown }[],
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await databaseClient.delete<T>(table, filters);
  return { data: data && data.length > 0 ? data[0] ?? null : null, error };
}

export async function countRecords(table: string, filters?: { column: string; value: unknown }[]): Promise<number> {
  return databaseClient.count(table, filters);
}
