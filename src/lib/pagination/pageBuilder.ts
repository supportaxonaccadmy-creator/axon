import type { PaginationOptions, PaginationInfo, OffsetPagination } from '@/types/pagination';

export function buildPageInfo(currentPage: number, totalPages: number): { isFirst: boolean; isLast: boolean; pages: number[] } {
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return { isFirst: currentPage === 1, isLast: currentPage === totalPages, pages };
}

export function buildNextPage(currentPage: number, totalPages: number): number | null { return currentPage < totalPages ? currentPage + 1 : null; }
export function buildPrevPage(currentPage: number): number | null { return currentPage > 1 ? currentPage - 1 : null; }
export function buildPageParams(page: number, pageSize: number): PaginationOptions { return { page: Math.max(1, page), pageSize: Math.max(1, Math.min(100, pageSize)) }; }
export function buildOffsetPagination<T>(data: T[], meta: PaginationInfo): OffsetPagination<T> { return { data, meta }; }
