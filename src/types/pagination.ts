export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CursorOptions {
  cursor: string | null;
  limit: number;
}

export interface CursorInfo {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

export interface OffsetPagination<T> {
  data: T[];
  meta: PaginationInfo;
}

export interface CursorPagination<T> {
  data: T[];
  meta: CursorInfo;
}
