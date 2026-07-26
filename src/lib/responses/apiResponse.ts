import type { ResponsePayload, PaginatedResponsePayload, PayloadMeta } from '@/types/response';

export { success } from './success';
export { failure, buildError, isFailure } from './failure';

export function apiSuccess<T>(data: T): ResponsePayload<T> { return { success: true, data, error: null, meta: null }; }
export function apiFailure<T>(code: string, message: string, details?: Record<string, string>): ResponsePayload<T> { return { success: false, data: null, error: { code, message, details: details ?? null }, meta: null }; }
export function buildApiMeta(page: number, pageSize: number, total: number): PayloadMeta { const totalPages = Math.ceil(total / pageSize) || 1; return { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }; }
export function paginatedSuccess<T>(data: T[], meta: PayloadMeta): PaginatedResponsePayload<T> { return { success: true, data, error: null, meta }; }
export function paginatedFailure<T>(code: string, message: string): PaginatedResponsePayload<T> { return { success: false, data: [], error: { code, message, details: null }, meta: buildApiMeta(1, 10, 0) }; }
