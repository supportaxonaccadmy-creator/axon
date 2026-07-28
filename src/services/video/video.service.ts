import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { storageService } from '@/services/storage';
import type {
  VideoWithFile, VideoProgress, VideoWatchHistoryEntry, ContinueWatchingItem,
  VideoAnalytics, SaveProgressInput, WatchSessionInput, SecureVideoUrlResult,
  VideoAccessResult, VideoStatus,
} from './video.types';
import {
  mapVideoRow, mapProgressRow,
  isVideoCompleted, getDeviceInfo, SIGNED_URL_EXPIRY_SECONDS,
} from './video.helpers';

export const videoStreamingService = {
  async getVideo(videoId: string): Promise<{ data: VideoWithFile | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('videos').select('*').eq('id', videoId).maybeSingle();
      if (error) { logger.error('videoStreamingService.getVideo', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapVideoRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getVideosByClass(classId: string): Promise<{ data: VideoWithFile[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('videos').select('*').eq('class_id', classId).order('sort_order', { ascending: true });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapVideoRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async checkVideoAccess(studentId: string, videoId: string): Promise<VideoAccessResult> {
    try {
      const supabase = getSupabaseClient();
      const { data: video, error: videoError } = await supabase.from('videos').select('*').eq('id', videoId).maybeSingle();
      if (videoError || !video) return { allowed: false, reason: 'Video not found' };

      const videoRow = video as Record<string, unknown>;
      if (videoRow.is_preview === true) return { allowed: true, reason: null };

      const { data: classRow } = await supabase.from('classes').select('id, chapter_id').eq('id', String(videoRow.class_id)).maybeSingle();
      if (!classRow) return { allowed: false, reason: 'Class not found' };

      const { data: chapterRow } = await supabase.from('chapters').select('id, subject_id').eq('id', (classRow as Record<string, unknown>).chapter_id).maybeSingle();
      if (!chapterRow) return { allowed: false, reason: 'Chapter not found' };

      const { data: subjectRow } = await supabase.from('subjects').select('id, batch_id').eq('id', (chapterRow as Record<string, unknown>).subject_id).maybeSingle();
      if (!subjectRow) return { allowed: false, reason: 'Subject not found' };

      const batchId = (subjectRow as Record<string, unknown>).batch_id;
      const { data: enrollment } = await supabase.from('enrollments').select('id').eq('profile_id', studentId).eq('batch_id', batchId).eq('access_status', 'active').maybeSingle();

      if (!enrollment) return { allowed: false, reason: 'Purchase this batch to access this class' };
      return { allowed: true, reason: null };
    } catch (err) {
      return { allowed: false, reason: err instanceof Error ? err.message : 'Access check failed' };
    }
  },

  async getSecureVideoUrl(studentId: string, videoId: string): Promise<SecureVideoUrlResult> {
    try {
      const { allowed, reason } = await this.checkVideoAccess(studentId, videoId);
      if (!allowed) return { url: null, error: null, accessDenied: true, denialReason: reason };

      const { data: video, error } = await this.getVideo(videoId);
      if (error || !video) return { url: null, error: error ?? 'Video not found', accessDenied: false, denialReason: null };

      if (video.youtubeUrl) return { url: video.youtubeUrl, error: null, accessDenied: false, denialReason: null };
      if (video.videoUrl) return { url: video.videoUrl, error: null, accessDenied: false, denialReason: null };

      if (video.fileId) {
        const { data: file } = await storageService.getFileById(video.fileId);
        if (!file) return { url: null, error: 'Video file not found', accessDenied: false, denialReason: null };
        const { url, error: urlError } = await storageService.getSignedUrl(file.storageBucket, file.filePath, SIGNED_URL_EXPIRY_SECONDS);
        if (urlError) return { url: null, error: urlError, accessDenied: false, denialReason: null };
        return { url, error: null, accessDenied: false, denialReason: null };
      }

      return { url: null, error: 'No video source available', accessDenied: false, denialReason: null };
    } catch (err) {
      return { url: null, error: err instanceof Error ? err.message : 'Unknown error', accessDenied: false, denialReason: null };
    }
  },

  async saveProgress(studentId: string, input: SaveProgressInput): Promise<{ data: VideoProgress | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: existing } = await supabase.from('video_progress').select('*').eq('student_id', studentId).eq('video_id', input.videoId).maybeSingle();

      const completedPct = input.completedPercentage;
      const isCompleted = input.isCompleted || isVideoCompleted(completedPct);

      if (existing) {
        const existingRow = existing as Record<string, unknown>;
        const newWatched = Math.max(Number(existingRow.watched_seconds ?? 0), input.watchedSeconds);
        const { data, error } = await supabase.from('video_progress').update({
          watched_seconds: newWatched,
          last_position_seconds: input.lastPositionSeconds,
          completed_percentage: completedPct,
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        }).eq('id', String(existingRow.id)).select('*').maybeSingle();

        if (error) { logger.error('videoStreamingService.saveProgress update', { error: error.message }); return { data: null, error: error.message }; }
        return { data: data ? mapProgressRow(data as Record<string, unknown>) : null, error: null };
      }

      const { data, error } = await supabase.from('video_progress').insert({
        student_id: studentId,
        video_id: input.videoId,
        watched_seconds: input.watchedSeconds,
        last_position_seconds: input.lastPositionSeconds,
        completed_percentage: completedPct,
        is_completed: isCompleted,
        last_watched_at: new Date().toISOString(),
      }).select('*').maybeSingle();

      if (error) { logger.error('videoStreamingService.saveProgress insert', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapProgressRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getProgress(studentId: string, videoId: string): Promise<{ data: VideoProgress | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('video_progress').select('*').eq('student_id', studentId).eq('video_id', videoId).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapProgressRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async recordWatchSession(studentId: string, input: WatchSessionInput): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('video_watch_history').insert({
        student_id: studentId,
        video_id: input.videoId,
        session_duration: input.sessionDuration,
        device_info: input.deviceInfo ?? getDeviceInfo(),
        watched_at: new Date().toISOString(),
      });
      if (error) { logger.error('videoStreamingService.recordWatchSession', { error: error.message }); return { error: error.message }; }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getWatchHistory(studentId: string, limit: number = 20): Promise<{ data: VideoWatchHistoryEntry[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('video_watch_history').select('*').eq('student_id', studentId).order('watched_at', { ascending: false }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id), studentId: String(row.student_id), videoId: String(row.video_id),
          sessionDuration: Number(row.session_duration ?? 0),
          deviceInfo: (row.device_info as Record<string, unknown> | null) ?? null,
          watchedAt: String(row.watched_at),
        };
      }), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getContinueWatching(studentId: string, limit: number = 10): Promise<{ data: ContinueWatchingItem[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: progressRows, error } = await supabase.from('video_progress')
        .select('*, videos(*)').eq('student_id', studentId)
        .order('last_watched_at', { ascending: false }).limit(limit);

      if (error) return { data: [], error: error.message };

      const items: ContinueWatchingItem[] = [];
      for (const row of (progressRows ?? [])) {
        const progress = mapProgressRow(row as Record<string, unknown>);
        const videoData = (row as Record<string, unknown>).videos as Record<string, unknown> | null;
        if (!videoData) continue;

        const video = mapVideoRow(videoData);
        const { data: classRow } = await supabase.from('classes').select('slug, chapter_id').eq('id', video.classId).maybeSingle();
        if (!classRow) continue;
        const classSlug = (classRow as Record<string, unknown>).slug as string;
        const chapterId = (classRow as Record<string, unknown>).chapter_id as string;

        const { data: chapterRow } = await supabase.from('chapters').select('slug, subject_id').eq('id', chapterId).maybeSingle();
        if (!chapterRow) continue;
        const chapterSlug = (chapterRow as Record<string, unknown>).slug as string;
        const subjectId = (chapterRow as Record<string, unknown>).subject_id as string;

        const { data: subjectRow } = await supabase.from('subjects').select('slug, batch_id').eq('id', subjectId).maybeSingle();
        if (!subjectRow) continue;
        const subjectSlug = (subjectRow as Record<string, unknown>).slug as string;
        const batchId = (subjectRow as Record<string, unknown>).batch_id as string;

        const { data: batchRow } = await supabase.from('batches').select('slug').eq('id', batchId).maybeSingle();
        const batchSlug = batchRow ? (batchRow as Record<string, unknown>).slug as string : '';

        items.push({
          videoId: video.id, videoTitle: video.title, videoSlug: video.slug,
          classId: video.classId, classSlug, chapterSlug, subjectSlug, batchSlug,
          thumbnail: video.thumbnail,
          durationSeconds: video.durationSeconds ?? video.duration,
          watchedSeconds: progress.watchedSeconds,
          completedPercentage: progress.completedPercentage,
          isCompleted: progress.isCompleted,
          lastWatchedAt: progress.lastWatchedAt ?? progress.updatedAt,
        });
      }

      return { data: items, error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getVideoAnalytics(): Promise<{ data: VideoAnalytics | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: videos } = await supabase.from('videos').select('id, title, status');
      const videoRows = (videos ?? []) as Array<Record<string, unknown>>;
      const totalVideos = videoRows.length;
      const publishedVideos = videoRows.filter((v) => v.status === 'published').length;
      const draftVideos = videoRows.filter((v) => v.status === 'draft').length;

      const { data: progressRows } = await supabase.from('video_progress').select('video_id, watched_seconds, completed_percentage, is_completed');
      const progressData = (progressRows ?? []) as Array<Record<string, unknown>>;
      const totalViews = progressData.length;
      const totalWatchTime = progressData.reduce((sum, r) => sum + Number(r.watched_seconds ?? 0), 0);
      const completedCount = progressData.filter((r) => r.is_completed === true).length;
      const avgCompletion = totalViews > 0 ? Math.round((completedCount / totalViews) * 100) : 0;

      const videoMap = new Map<string, { title: string; views: number; completionSum: number }>();
      for (const p of progressData) {
        const vid = String(p.video_id);
        const existing = videoMap.get(vid) ?? { title: '', views: 0, completionSum: 0 };
        existing.views += 1;
        existing.completionSum += Number(p.completed_percentage ?? 0);
        videoMap.set(vid, existing);
      }
      for (const v of videoRows) {
        const vid = String(v.id);
        const entry = videoMap.get(vid);
        if (entry) entry.title = String(v.title);
      }

      const mostWatched = Array.from(videoMap.entries())
        .map(([videoId, info]) => ({
          videoId, title: info.title,
          views: info.views,
          averageCompletion: info.views > 0 ? Math.round(info.completionSum / info.views) : 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      return {
        data: { totalVideos, publishedVideos, draftVideos, totalViews, totalWatchTimeSeconds: totalWatchTime, averageCompletionRate: avgCompletion, mostWatched },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateVideo(videoId: string, input: Partial<{ title: string; description: string | null; fileId: string | null; thumbnailFileId: string | null; durationSeconds: number | null; videoQuality: string | null; resolution: string | null; status: VideoStatus; isPreview: boolean }>): Promise<{ data: VideoWithFile | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.fileId !== undefined) updateData.file_id = input.fileId;
      if (input.thumbnailFileId !== undefined) updateData.thumbnail_file_id = input.thumbnailFileId;
      if (input.durationSeconds !== undefined) updateData.duration_seconds = input.durationSeconds;
      if (input.videoQuality !== undefined) updateData.video_quality = input.videoQuality;
      if (input.resolution !== undefined) updateData.resolution = input.resolution;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.isPreview !== undefined) updateData.is_preview = input.isPreview;

      const { data, error } = await supabase.from('videos').update(updateData).eq('id', videoId).select('*').maybeSingle();
      if (error) { logger.error('videoStreamingService.updateVideo', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapVideoRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async deleteVideo(videoId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('videos').delete().eq('id', videoId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
