import type { CursorOptions, CursorInfo, CursorPagination } from '@/types/pagination';

export function encodeCursor(data: Record<string, unknown>): string { return btoa(JSON.stringify(data)); }
export function decodeCursor(cursor: string): Record<string, unknown> | null { try { return JSON.parse(atob(cursor)); } catch { return null; } }
export function buildCursorMeta(nextCursor: string | null, limit: number, hasMore: boolean): CursorInfo { return { nextCursor, hasMore, limit }; }

export function paginateWithCursor<T>(items: T[], cursor: string | null, limit: number = 10): CursorPagination<T> {
  const safeLimit = Math.max(1, Math.min(100, limit));
  const startIndex = cursor ? (decodeCursor(cursor)?.offset as number ?? 0) : 0;
  const data = items.slice(startIndex, startIndex + safeLimit);
  const endIndex = startIndex + safeLimit;
  const hasMore = endIndex < items.length;
  const nextCursor = hasMore ? encodeCursor({ offset: endIndex }) : null;
  return { data, meta: buildCursorMeta(nextCursor, safeLimit, hasMore) };
}

export function createCursorParams(cursor: string | null, limit: number = 10): CursorOptions { return { cursor, limit: Math.max(1, Math.min(100, limit)) }; }
