import type { LmsStatus } from '@/types/lms';

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  column: string;
  direction: SortDirection;
}

export const DEFAULT_SORT: SortOption = { column: 'sort_order', direction: 'asc' };
export const CREATED_AT_SORT: SortOption = { column: 'created_at', direction: 'desc' };

export function withDefaultSort(sort?: SortOption | undefined): SortOption {
  return sort ?? DEFAULT_SORT;
}

export function sortByStatus<T extends { status: LmsStatus }>(items: T[]): T[] {
  const order: Record<LmsStatus, number> = { published: 0, draft: 1, archived: 2 };
  return [...items].sort((a, b) => order[a.status] - order[b.status]);
}

export function sortBySortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

export function filterPublished<T extends { status: LmsStatus }>(items: T[]): T[] {
  return items.filter((item) => item.status === 'published');
}
