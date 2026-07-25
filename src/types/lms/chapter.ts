import type { LmsStatus } from './batch';

export interface Chapter {
  id: string;
  subjectId: string;
  title: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  status: LmsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterInsert {
  subjectId: string;
  title: string;
  slug: string;
  description?: string | null | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface ChapterUpdate {
  subjectId?: string | undefined;
  title?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  sortOrder?: number | undefined;
  status?: LmsStatus | undefined;
}

export interface ChapterWithCounts extends Chapter {
  classCount: number;
}

export interface ChapterRow {
  id: string;
  subject_id: string;
  title: string;
  slug: string;
  description: string | null;
  sort_order: number;
  status: LmsStatus;
  created_at: string;
  updated_at: string;
}
