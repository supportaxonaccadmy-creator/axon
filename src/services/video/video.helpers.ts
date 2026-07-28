import type { VideoStatus, VideoWithFile, VideoProgress } from './video.types';

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatWatchTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
}

export function calculateCompletionPercentage(watched: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((watched / total) * 100));
}

export function isVideoCompleted(percentage: number): boolean {
  return percentage >= 90;
}

export function getDeviceInfo(): Record<string, unknown> {
  if (typeof navigator === 'undefined') return {};
  const ua = navigator.userAgent;
  let browser = 'unknown';
  let os = 'unknown';
  if (/Chrome\/[\d.]+/.test(ua)) browser = 'Chrome';
  else if (/Firefox\/[\d.]+/.test(ua)) browser = 'Firefox';
  else if (/Safari\/[\d.]+/.test(ua)) browser = 'Safari';
  else if (/Edge\/[\d.]+/.test(ua)) browser = 'Edge';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  return { browser, os, userAgent: ua, screenWidth: window.screen?.width, screenHeight: window.screen?.height };
}

export function mapVideoRow(row: Record<string, unknown>): VideoWithFile {
  return {
    id: String(row.id),
    classId: String(row.class_id),
    title: String(row.title),
    slug: String(row.slug),
    description: (row.description as string | null) ?? null,
    youtubeUrl: (row.youtube_url as string | null) ?? null,
    videoUrl: (row.video_url as string | null) ?? null,
    duration: (row.duration as number | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    thumbnail: (row.thumbnail as string | null) ?? null,
    fileId: (row.file_id as string | null) ?? null,
    thumbnailFileId: (row.thumbnail_file_id as string | null) ?? null,
    videoQuality: (row.video_quality as string | null) ?? null,
    resolution: (row.resolution as string | null) ?? null,
    isPreview: Boolean(row.is_preview),
    status: (row.status as VideoStatus) ?? 'draft',
    sortOrder: Number(row.sort_order ?? 0),
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapProgressRow(row: Record<string, unknown>): VideoProgress {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    videoId: String(row.video_id),
    watchedSeconds: Number(row.watched_seconds ?? 0),
    lastPositionSeconds: Number(row.last_position_seconds ?? 0),
    completedPercentage: Number(row.completed_percentage ?? 0),
    isCompleted: Boolean(row.is_completed),
    lastWatchedAt: (row.last_watched_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export const PLAYBACK_SPEEDS = [0.5, 1, 1.25, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

export const PROGRESS_SAVE_INTERVAL_MS = 10000;
export const COMPLETION_THRESHOLD = 90;
export const SIGNED_URL_EXPIRY_SECONDS = 3600;
