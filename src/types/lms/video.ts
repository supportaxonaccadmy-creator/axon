import type { LmsStatus } from './batch';

export interface Video {
  id: string;
  classId: string;
  title: string;
  slug: string;
  description: string | null;
  youtubeUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  thumbnail: string | null;
  isPreview: boolean;
  status: LmsStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoInsert {
  classId: string;
  title: string;
  slug: string;
  description?: string | null | undefined;
  youtubeUrl?: string | null | undefined;
  videoUrl?: string | null | undefined;
  duration?: number | null | undefined;
  thumbnail?: string | null | undefined;
  isPreview?: boolean | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface VideoUpdate {
  classId?: string | undefined;
  title?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  youtubeUrl?: string | null | undefined;
  videoUrl?: string | null | undefined;
  duration?: number | null | undefined;
  thumbnail?: string | null | undefined;
  isPreview?: boolean | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface VideoRow {
  id: string;
  class_id: string;
  title: string;
  slug: string;
  description: string | null;
  youtube_url: string | null;
  video_url: string | null;
  duration: number | null;
  thumbnail: string | null;
  is_preview: boolean;
  status: LmsStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
