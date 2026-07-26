import type { PdfNote } from '@/types/lms';
import type { SortOption } from '@/lib/helpers/sortingHelper';

export interface PdfFilterOptions {
  classId?: string | undefined;
  publishedOnly?: boolean | undefined;
  downloadableOnly?: boolean | undefined;
  search?: string | undefined;
  sort?: SortOption | undefined;
}

export function buildPdfPath(batchSlug: string, subjectSlug: string, chapterSlug: string, classSlug: string, pdfSlug: string): string {
  return `/batches/${batchSlug}/${subjectSlug}/${chapterSlug}/${classSlug}/pdf-notes/${pdfSlug}`;
}

export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '--';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function sortPdfNotes(notes: PdfNote[], sort: SortOption = { column: 'sort_order', direction: 'asc' }): PdfNote[] {
  return [...notes].sort((a, b) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const col = sort.column as keyof PdfNote;
    const aVal = a[col];
    const bVal = b[col];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });
}
