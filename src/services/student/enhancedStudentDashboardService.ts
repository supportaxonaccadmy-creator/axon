import type { StudentContinueLearning } from '@/types/studentDashboard';
import { logger } from '@/lib/logger';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { batchService } from '@/services/lms/batchService';
import { studentDashboardService } from './studentDashboardService';

export interface StudyStreak { currentStreak: number; longestStreak: number; lastStudyDate: string | null; thisWeekActive: boolean[]; }
export interface WeeklyActivity { day: string; date: string; hoursStudied: number; classesCompleted: number; }
export interface LearningSummary { totalBatches: number; totalClasses: number; completedClasses: number; overallProgress: number; studyTimeThisWeek: number; mcqAttemptsThisWeek: number; }
export interface UpcomingTask { id: string; title: string; type: 'mcq' | 'video' | 'pdf' | 'live_class'; dueDate: string; batchTitle: string; priority: 'high' | 'medium' | 'low'; }
export interface RecentActivity { id: string; type: 'class_completed' | 'mcq_attempted' | 'batch_enrolled' | 'video_watched' | 'pdf_downloaded'; title: string; description: string; timestamp: string; }

export const enhancedStudentDashboardService = {
  async getStudyStreak(_profileId: string): Promise<{ data: StudyStreak | null; error: string | null }> {
    return { data: { currentStreak: 0, longestStreak: 0, lastStudyDate: null, thisWeekActive: [false, false, false, false, false, false, false] }, error: null };
  },
  async getWeeklyActivity(_profileId: string): Promise<{ data: WeeklyActivity[] | null; error: string | null }> {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date(); const dayOfWeek = (now.getDay() + 6) % 7; const weekStart = new Date(now); weekStart.setDate(now.getDate() - dayOfWeek);
    const activities: WeeklyActivity[] = days.map((day, i) => { const date = new Date(weekStart); date.setDate(weekStart.getDate() + i); return { day, date: date.toISOString(), hoursStudied: 0, classesCompleted: 0 }; });
    return { data: activities, error: null };
  },
  async getLearningSummary(profileId: string): Promise<{ data: LearningSummary | null; error: string | null }> {
    try {
      const batchesResult = await studentDashboardService.getMyBatches(profileId);
      const batches = batchesResult.data ?? [];
      return { data: { totalBatches: batches.length, totalClasses: batches.reduce((sum, b) => sum + b.totalClasses, 0), completedClasses: batches.reduce((sum, b) => sum + b.completedClasses, 0), overallProgress: batches.length > 0 ? Math.round(batches.reduce((sum, b) => sum + b.progress, 0) / batches.length) : 0, studyTimeThisWeek: 0, mcqAttemptsThisWeek: 0 }, error: null };
    } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load summary'; logger.error('enhancedStudentDashboardService.getLearningSummary', { error: msg }); return { data: null, error: msg }; }
  },
  async getUpcomingTasks(_profileId: string): Promise<{ data: UpcomingTask[] | null; error: string | null }> { return { data: [], error: null }; },
  async getRecentActivity(_profileId: string): Promise<{ data: RecentActivity[] | null; error: string | null }> { return { data: [], error: null }; },
  async getContinueLearning(profileId: string): Promise<{ data: StudentContinueLearning[] | null; error: string | null }> {
    try {
      const enrollmentsResult = await enrollmentService.getAccessibleBatches(profileId);
      if (enrollmentsResult.error) return { data: null, error: enrollmentsResult.error };
      const enrollments = enrollmentsResult.data ?? [];
      if (enrollments.length === 0) return { data: [], error: null };
      const batchIds = enrollments.map((e) => e.batchId);
      const batchesResult = await batchService.list({ publishedOnly: true });
      if (batchesResult.error) return { data: null, error: batchesResult.error };
      const enrolledBatches = batchesResult.data.filter((b) => batchIds.includes(b.id));
      const items: StudentContinueLearning[] = enrolledBatches.slice(0, 4).map((batch) => ({ id: batch.id, batchId: batch.id, batchTitle: batch.title, classId: '', classTitle: batch.title, classSlug: batch.slug, type: 'video' as const, thumbnailUrl: batch.thumbnail, progress: 0, lastAccessedAt: batch.createdAt, duration: null }));
      return { data: items, error: null };
    } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load continue learning'; logger.error('enhancedStudentDashboardService.getContinueLearning', { error: msg }); return { data: null, error: msg }; }
  },
};
