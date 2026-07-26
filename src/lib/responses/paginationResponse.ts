import type { PaginatedResponsePayload, PayloadMeta } from '@/types/response';

export function buildPaginationResponse<T>(data: T[], page: number, pageSize: number, total: number): PaginatedResponsePayload<T> {
  const totalPages = Math.ceil(total / pageSize) || 1;
  const meta: PayloadMeta = { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
  return { success: true, data, error: null, meta };
}

export function buildEmptyPaginationResponse<T>(page: number = 1, pageSize: number = 10): PaginatedResponsePayload<T> { return buildPaginationResponse([], page, pageSize, 0); }
export function buildPaginationErrorResponse<T>(code: string, message: string): PaginatedResponsePayload<T> { return { success: false, data: [], error: { code, message, details: null }, meta: buildApiMeta(1, 10, 0) }; }

function buildApiMeta(page: number, pageSize: number, total: number): PayloadMeta { const totalPages = Math.ceil(total / pageSize) || 1; return { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }; }
