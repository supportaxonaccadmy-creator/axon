import type { LmsStatus } from './batch';

export interface PdfNote {
  id: string;
  classId: string;
  title: string;
  slug: string;
  description: string | null;
  fileUrl: string | null;
  totalPages: number | null;
  fileSize: number | null;
  isDownloadable: boolean;
  status: LmsStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PdfNoteInsert {
  classId: string;
  title: string;
  slug: string;
  description?: string | null | undefined;
  fileUrl?: string | null | undefined;
  totalPages?: number | null | undefined;
  fileSize?: number | null | undefined;
  isDownloadable?: boolean | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface PdfNoteUpdate {
  classId?: string | undefined;
  title?: string | undefined;
  slug?: string | undefined;
  description?: string | null | undefined;
  fileUrl?: string | null | undefined;
  totalPages?: number | null | undefined;
  fileSize?: number | null | undefined;
  isDownloadable?: boolean | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface PdfNoteRow {
  id: string;
  class_id: string;
  title: string;
  slug: string;
  description: string | null;
  file_url: string | null;
  total_pages: number | null;
  file_size: number | null;
  is_downloadable: boolean;
  status: LmsStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
