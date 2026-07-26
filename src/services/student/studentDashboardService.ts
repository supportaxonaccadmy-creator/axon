import type {
  StudentDashboardSummary,
  StudentBatchInfo,
  StudentContinueLearning,
  StudentRecentClass,
  StudentLiveClass,
  StudentAnnouncement,
  StudentProgress,
} from '@/types/studentDashboard';
import { logger } from '@/lib/logger';
import { enrollmentService } from '@/services/lms/enrollmentService';

export const studentDashboardService = {
  async getDashboard(profileId: string): Promise<{ data: StudentDashboardSummary | null; error: string | null }> {
    try {
      const [batches, continueLearning, recentClasses, upcomingLiveClasses, announcements, progress] = await Promise.all([
        this.getMyBatches(profileId),
        this.getContinueLearning(profileId),
        this.getRecentClasses(profileId),
        this.getUpcomingLiveClasses(profileId),
        this.getAnnouncements(),
        this.getProgress(profileId),
      ]);
      const quickActions = [
        { id: 'continue', label: 'Continue Learning', description: 'Resume where you left off', icon: 'PlayCircle', href: '/student/continue', variant: 'primary' as const },
        { id: 'mcq', label: 'MCQ Practice', description: 'Test your knowledge', icon: 'HelpCircle', href: '/student/mcq-practice', variant: 'outline' as const },
        { id: 'notes', label: 'PDF Notes', description: 'Browse study materials', icon: 'FileText', href: '/student/pdf-notes', variant: 'outline' as const },
        { id: 'progress', label: 'View Progress', description: 'Track your performance', icon: 'TrendingUp', href: '/student/progress', variant: 'outline' as const },
      ];
      return {
        data: {
          batches: batches.data ?? [],
          continueLearning: continueLearning.data ?? [],
          recentClasses: recentClasses.data ?? [],
          upcomingLiveClasses: upcomingLiveClasses.data ?? [],
          announcements: announcements.data ?? [],
          progress: progress.data ?? { purchasedBatches: 0, completedClasses: 0, totalClasses: 0, completionPercent: 0, mcqAttempted: 0, averageScore: 0, studyTimeHours: 0, certificates: 0 },
          quickActions,
          lastRefreshed: new Date().toISOString(),
        },
        error: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      logger.error('studentDashboardService.getDashboard', { error: msg });
      return { data: null, error: msg };
    }
  },

  async getMyBatches(profileId: string): Promise<{ data: StudentBatchInfo[] | null; error: string | null }> {
    try {
      const result = await enrollmentService.getAccessibleBatches(profileId);
      if (result.error) return { data: null, error: result.error };
      const batches = (result.data ?? []).map((e) => ({
        id: e.batchId, title: 'Untitled Batch', slug: '', description: null,
        status: 'active', thumbnailUrl: null,
        enrolledAt: e.enrolledAt ?? new Date().toISOString(),
        expiresAt: e.expiresAt ?? null, progress: 0, totalClasses: 0, completedClasses: 0,
      }));
      return { data: batches, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load batches';
      logger.error('studentDashboardService.getMyBatches', { error: msg });
      return { data: null, error: msg };
    }
  },

  async getContinueLearning(_profileId: string): Promise<{ data: StudentContinueLearning[] | null; error: string | null }> {
    return { data: [], error: null };
  },

  async getRecentClasses(_profileId: string): Promise<{ data: StudentRecentClass[] | null; error: string | null }> {
    return { data: [], error: null };
  },

  async getUpcomingLiveClasses(_profileId: string): Promise<{ data: StudentLiveClass[] | null; error: string | null }> {
    return { data: [], error: null };
  },

  async getAnnouncements(): Promise<{ data: StudentAnnouncement[] | null; error: string | null }> {
    return { data: [{ id: '1', title: 'Welcome to Axon Nursing Academy', message: 'Start your learning journey today by exploring your enrolled batches.', type: 'info', createdAt: new Date().toISOString(), read: false }], error: null };
  },

  async getProgress(profileId: string): Promise<{ data: StudentProgress | null; error: string | null }> {
    try {
      const batchesResult = await this.getMyBatches(profileId);
      const batchCount = batchesResult.data?.length ?? 0;
      return { data: { purchasedBatches: batchCount, completedClasses: 0, totalClasses: 0, completionPercent: 0, mcqAttempted: 0, averageScore: 0, studyTimeHours: 0, certificates: 0 }, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load progress';
      logger.error('studentDashboardService.getProgress', { error: msg });
      return { data: null, error: msg };
    }
  },
};
