export type VideoStatus = 'draft' | 'published' | 'archived';

export interface VideoWithFile {
  id: string;
  classId: string;
  title: string;
  slug: string;
  description: string | null;
  youtubeUrl: string | null;
  videoUrl: string | null;
  duration: number | null;
  durationSeconds: number | null;
  thumbnail: string | null;
  fileId: string | null;
  thumbnailFileId: string | null;
  videoQuality: string | null;
  resolution: string | null;
  isPreview: boolean;
  status: VideoStatus;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoProgress {
  id: string;
  studentId: string;
  videoId: string;
  watchedSeconds: number;
  lastPositionSeconds: number;
  completedPercentage: number;
  isCompleted: boolean;
  lastWatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoWatchHistoryEntry {
  id: string;
  studentId: string;
  videoId: string;
  sessionDuration: number;
  deviceInfo: Record<string, unknown> | null;
  watchedAt: string;
}

export interface ContinueWatchingItem {
  videoId: string;
  videoTitle: string;
  videoSlug: string;
  classId: string;
  classSlug: string;
  chapterSlug: string;
  subjectSlug: string;
  batchSlug: string;
  thumbnail: string | null;
  durationSeconds: number | null;
  watchedSeconds: number;
  completedPercentage: number;
  isCompleted: boolean;
  lastWatchedAt: string;
}

export interface VideoAnalytics {
  totalVideos: number;
  publishedVideos: number;
  draftVideos: number;
  totalViews: number;
  totalWatchTimeSeconds: number;
  averageCompletionRate: number;
  mostWatched: Array<{
    videoId: string;
    title: string;
    views: number;
    averageCompletion: number;
  }>;
}

export interface SaveProgressInput {
  videoId: string;
  watchedSeconds: number;
  lastPositionSeconds: number;
  completedPercentage: number;
  isCompleted: boolean;
}

export interface WatchSessionInput {
  videoId: string;
  sessionDuration: number;
  deviceInfo?: Record<string, unknown> | undefined;
}

export interface SecureVideoUrlResult {
  url: string | null;
  error: string | null;
  accessDenied: boolean;
  denialReason: string | null;
}

export interface VideoAccessResult {
  allowed: boolean;
  reason: string | null;
}
