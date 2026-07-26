import type { LmsStatus } from './batch';

export interface BatchPricing {
  id: string;
  batchId: string;
  price: number;
  salePrice: number | null;
  currency: string;
  isFree: boolean;
  lifetimeAccess: boolean;
  accessDurationDays: number | null;
  status: LmsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BatchPricingInsert {
  batchId: string;
  price?: number | undefined;
  salePrice?: number | null | undefined;
  currency?: string | undefined;
  isFree?: boolean | undefined;
  lifetimeAccess?: boolean | undefined;
  accessDurationDays?: number | null | undefined;
  status?: LmsStatus | undefined;
}

export interface BatchPricingUpdate {
  batchId?: string | undefined;
  price?: number | undefined;
  salePrice?: number | null | undefined;
  currency?: string | undefined;
  isFree?: boolean | undefined;
  lifetimeAccess?: boolean | undefined;
  accessDurationDays?: number | null | undefined;
  status?: LmsStatus | undefined;
}

export interface BatchPricingRow {
  id: string;
  batch_id: string;
  price: number;
  sale_price: number | null;
  currency: string;
  is_free: boolean;
  lifetime_access: boolean;
  access_duration_days: number | null;
  status: LmsStatus;
  created_at: string;
  updated_at: string;
}
