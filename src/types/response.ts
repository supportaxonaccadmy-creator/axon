export interface ResponsePayload<T> {
  success: boolean;
  data: T | null;
  error: PayloadError | null;
  meta: PayloadMeta | null;
}

export interface PayloadError {
  code: string;
  message: string;
  details: Record<string, string> | null;
}

export interface PayloadMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponsePayload<T> {
  success: boolean;
  data: T[];
  error: PayloadError | null;
  meta: PayloadMeta;
}

export interface SuccessPayload<T> {
  success: true;
  data: T;
  error: null;
  meta: null;
}

export interface FailurePayload {
  success: false;
  data: null;
  error: PayloadError;
  meta: null;
}
