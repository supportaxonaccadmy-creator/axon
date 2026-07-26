import type { FilterCondition, OrderCondition } from '@/types/database';
import type { SortOption, SortDirection } from '@/lib/helpers/sortingHelper';

export interface AdvancedFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'is' | 'in';
  value: unknown;
}

export function buildFilters(base?: { column: string; value: unknown }[], advanced?: AdvancedFilter[]): FilterCondition[] {
  const conditions: FilterCondition[] = [];
  if (base) {
    for (const f of base) {
      conditions.push({ column: f.column, operator: 'eq', value: f.value });
    }
  }
  if (advanced) {
    for (const f of advanced) {
      conditions.push({ column: f.column, operator: f.operator, value: f.value });
    }
  }
  return conditions;
}

export function buildSearchQuery(search: string | undefined, columns: string[]): string | null {
  if (!search || search.trim().length === 0) return null;
  const term = search.trim();
  return columns.map((c) => `${c}.ilike.%${term}%`).join(',');
}

export function buildPagination(page: number = 1, pageSize: number = 10): { offset: number; limit: number; page: number; pageSize: number } {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(100, pageSize));
  return { offset: (safePage - 1) * safeSize, limit: safeSize, page: safePage, pageSize: safeSize };
}

export function buildSortOptions(sort?: SortOption | undefined, fallback?: SortOption): OrderCondition[] {
  const effective = sort ?? fallback ?? { column: 'sort_order', direction: 'asc' as SortDirection };
  return [{ column: effective.column, order: effective.direction }];
}

export function buildStatusFilter(status?: string | undefined): { column: string; value: unknown } | null {
  if (!status) return null;
  return { column: 'status', value: status };
}

export function buildPublishedFilter(publishedOnly?: boolean | undefined): { column: string; value: unknown } | null {
  if (!publishedOnly) return null;
  return { column: 'status', value: 'published' };
}

export function buildParentFilter(parentColumn: string, parentId?: string | undefined): { column: string; value: unknown } | null {
  if (!parentId) return null;
  return { column: parentColumn, value: parentId };
}

export function mergeFilters(...filters: ({ column: string; value: unknown } | null)[]): { column: string; value: unknown }[] {
  return filters.filter((f): f is { column: string; value: unknown } => f !== null);
}

export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize) || 1;
}

export function calculateOffset(page: number, pageSize: number): number {
  return (Math.max(1, page) - 1) * pageSize;
}

export function hasMore(page: number, totalPages: number): boolean {
  return page < totalPages;
}

export function hasPrevious(page: number): boolean {
  return page > 1;
}
