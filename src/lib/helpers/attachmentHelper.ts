import type { Attachment } from '@/types/lms';
import type { SortOption } from '@/lib/helpers/sortingHelper';

export interface AttachmentFilterOptions {
  classId?: string | undefined;
  publishedOnly?: boolean | undefined;
  fileType?: string | undefined;
  search?: string | undefined;
  sort?: SortOption | undefined;
}

export function buildAttachmentPath(batchSlug: string, subjectSlug: string, chapterSlug: string, classSlug: string, attachmentId: string): string {
  return `/batches/${batchSlug}/${subjectSlug}/${chapterSlug}/${classSlug}/attachments/${attachmentId}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function isImageType(fileType: string): boolean {
  return fileType.startsWith('image/');
}

export function isPdfType(fileType: string): boolean {
  return fileType === 'application/pdf';
}

export function sortAttachments(items: Attachment[], sort: SortOption = { column: 'sort_order', direction: 'asc' }): Attachment[] {
  return [...items].sort((a, b) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const col = sort.column as keyof Attachment;
    const aVal = a[col];
    const bVal = b[col];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });
}
