import type { LmsStatus } from './batch';

export interface Subject {
  id: string;
  batchId: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  status: LmsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectInsert {
  batchId: string;
  title: string;
  slug: string;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface SubjectUpdate {
  batchId?: string | undefined;
  title?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface SubjectWithCounts extends Subject {
  chapterCount: number;
}

export interface SubjectRow {
  id: string;
  batch_id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  status: LmsStatus;
  created_at: string;
  updated_at: string;
}
