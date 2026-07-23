export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'is'
  | 'in'
  | 'contains'
  | 'range';

export interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: unknown;
}

export type SortOrder = 'asc' | 'desc';

export interface OrderCondition {
  column: string;
  order: SortOrder;
}

export interface QueryOptions {
  filters?: FilterCondition[] | undefined;
  order?: OrderCondition[] | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  select?: string | undefined;
  single?: boolean | undefined;
  count?: 'exact' | 'planned' | 'estimated' | undefined;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CountResult {
  count: number;
  error: string | null;
}

export type TransactionCallback<T> = () => Promise<T>;
