import type { PaginationOptions, PaginationInfo, OffsetPagination } from '@/types/pagination';

export function calculateOffset(page: number, pageSize: number): number { return (Math.max(1, page) - 1) * Math.max(1, pageSize); }
export function calculateTotalPages(total: number, pageSize: number): number { return Math.ceil(total / pageSize) || 1; }

export function buildPaginationMeta(page: number, pageSize: number, total: number): PaginationInfo {
  const totalPages = calculateTotalPages(total, pageSize);
  return { page: Math.max(1, page), pageSize: Math.max(1, pageSize), total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}

export function paginate<T>(items: T[], page: number = 1, pageSize: number = 10): OffsetPagination<T> {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(100, pageSize));
  const offset = calculateOffset(safePage, safeSize);
  const data = items.slice(offset, offset + safeSize);
  return { data, meta: buildPaginationMeta(safePage, safeSize, items.length) };
}

export function hasNextPage(page: number, totalPages: number): boolean { return page < totalPages; }
export function hasPrevPage(page: number): boolean { return page > 1; }
export function sanitizePaginationParams(page: unknown, pageSize: unknown): PaginationOptions {
  return { page: Math.max(1, typeof page === 'number' ? page : 1), pageSize: Math.max(1, Math.min(100, typeof pageSize === 'number' ? pageSize : 10)) };
}
