import type { LmsStatus } from './batch';

export interface Attachment {
  id: string;
  classId: string;
  title: string;
  fileUrl: string | null;
  fileType: string | null;
  fileSize: number | null;
  status: LmsStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentInsert {
  classId: string;
  title: string;
  fileUrl?: string | null | undefined;
  fileType?: string | null | undefined;
  fileSize?: number | null | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface AttachmentUpdate {
  classId?: string | undefined;
  title?: string | undefined;
  fileUrl?: string | null | undefined;
  fileType?: string | null | undefined;
  fileSize?: number | null | undefined;
  status?: LmsStatus | undefined;
  sortOrder?: number | undefined;
}

export interface AttachmentRow {
  id: string;
  class_id: string;
  title: string;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  status: LmsStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
