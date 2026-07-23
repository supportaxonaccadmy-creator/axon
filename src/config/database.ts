import { PAGINATION } from '@/constants/pagination';

export const databaseConfig = {
  defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
  maxPageSize: PAGINATION.MAX_PAGE_SIZE,
  defaultPage: PAGINATION.DEFAULT_PAGE,
  queryTimeout: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000,
} as const;
