import type { LmsStatus } from './batch';

export interface Class {
  id: string;
  chapterId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  sortOrder: number;
  isPreview: boolean;
  status: LmsStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ClassInsert {
  chapterId: string;
  title: string;
  slug: string;
  description?: string | null | undefined;
  thumbnail?: string | null | undefined;
  duration?: number | null | undefined;
  sortOrder?: number | undefined;
  isPreview?: boolean | undefined;
  status?: LmsStatus | undefined;
}

export interface ClassUpdate {
  chapterId?: string | undefined;
  title?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  thumbnail?: string | null | undefined;
  duration?: number | null | undefined;
  sortOrder?: number | undefined;
  isPreview?: boolean | undefined;
  status?: LmsStatus | undefined;
}

export interface ClassRow {
  id: string;
  chapter_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  duration: number | null;
  sort_order: number;
  is_preview: boolean;
  status: LmsStatus;
  created_at: string;
  updated_at: string;
}
