export type UUID = string;
export type Timestamp = string;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type Primitive = string | number | boolean | bigint | symbol | null | undefined;
export type ValueOf<T> = T[keyof T];

export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string | undefined;
  duration: number;
  dismissible: boolean;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortParams {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | null;
}
