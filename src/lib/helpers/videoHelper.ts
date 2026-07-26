import type { Video } from '@/types/lms';
import type { SortOption } from '@/lib/helpers/sortingHelper';

export interface VideoFilterOptions {
  classId?: string | undefined;
  publishedOnly?: boolean | undefined;
  previewOnly?: boolean | undefined;
  search?: string | undefined;
  sort?: SortOption | undefined;
}

export function buildVideoPath(batchSlug: string, subjectSlug: string, chapterSlug: string, classSlug: string, videoSlug: string): string {
  return `/batches/${batchSlug}/${subjectSlug}/${chapterSlug}/${classSlug}/videos/${videoSlug}`;
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === 0) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function sortVideos(videos: Video[], sort: SortOption = { column: 'sort_order', direction: 'asc' }): Video[] {
  return [...videos].sort((a, b) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    const col = sort.column as keyof Video;
    const aVal = a[col];
    const bVal = b[col];
    if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
    return String(aVal).localeCompare(String(bVal)) * dir;
  });
}
