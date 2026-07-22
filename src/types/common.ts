/**
 * Common shared types used across the application.
 */

export type ID = string;

export type UUID = string;

export type ISODateString = string;

export type Nullable<T> = T | null;

export type Maybe<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PickOptional<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];

export type AsyncResult<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
