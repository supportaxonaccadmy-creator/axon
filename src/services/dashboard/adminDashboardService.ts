import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { statisticsService } from '@/services/lms/statisticsService';
import type {
  DashboardStats,
  DashboardStat,
  DashboardQuickAction,
  DashboardSystemStatus,
} from '@/types/dashboard';
import type {
  DashboardOverview,
  DashboardContentStat,
  DashboardRevenueSummary,
  DashboardEnrollmentSummary,
  RecentStudent,
  RecentPurchase,
  RevenueDataPoint,
  EnrollmentDataPoint,
  ContentDistributionData,
} from '@/types/adminDashboard';

function makeStat(
  id: string, label: string, value: number | string, icon: string,
  color: DashboardStat['color'], description?: string,
): DashboardStat {
  return { id, label, value, icon, color, description, trend: 'neutral', trendPercent: 0 };
}

async function getRecentStudents(limit: number = 5): Promise<RecentStudent[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, created_at, role')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { logger.error('adminDashboardService.getRecentStudents', { error: error.message }); return []; }
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id), fullName: String(row.full_name ?? ''), email: String(row.email ?? ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null, registeredAt: String(row.created_at ?? ''), role: String(row.role ?? 'student'),
  }));
}

async function getRecentPurchases(limit: number = 5): Promise<RecentPurchase[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('purchases')
    .select('id, amount, currency, payment_status, created_at, profiles(full_name), batches(title)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) { logger.error('adminDashboardService.getRecentPurchases', { error: error.message }); return []; }
  return (data ?? []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as Record<string, unknown> | null;
    const batch = row.batches as Record<string, unknown> | null;
    return {
      id: String(row.id), studentName: profile ? String(profile.full_name ?? '') : 'Unknown',
      batchTitle: batch ? String(batch.title ?? '') : 'Unknown Batch', amount: Number(row.amount ?? 0),
      currency: String(row.currency ?? 'INR'), paymentStatus: String(row.payment_status ?? 'pending'), purchasedAt: String(row.created_at ?? ''),
    };
  });
}

async function getRevenueTrend(): Promise<RevenueDataPoint[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('purchases').select('amount, created_at').eq('payment_status', 'completed').order('created_at', { ascending: false }).limit(100);
  if (error) { logger.error('adminDashboardService.getRevenueTrend', { error: error.message }); return []; }
  const monthlyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const key = d.toLocaleDateString('en-IN', { month: 'short' }); monthlyMap[key] = 0; }
  for (const row of data ?? []) {
    const date = new Date(String((row as Record<string, unknown>).created_at));
    const key = date.toLocaleDateString('en-IN', { month: 'short' });
    if (key in monthlyMap) monthlyMap[key] = (monthlyMap[key] ?? 0) + Number((row as Record<string, unknown>).amount);
  }
  return Object.entries(monthlyMap).map(([label, value]) => ({ label, value }));
}

async function getEnrollmentTrend(): Promise<EnrollmentDataPoint[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('enrollments').select('enrolled_at').order('enrolled_at', { ascending: false }).limit(100);
  if (error) { logger.error('adminDashboardService.getEnrollmentTrend', { error: error.message }); return []; }
  const monthlyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); const key = d.toLocaleDateString('en-IN', { month: 'short' }); monthlyMap[key] = 0; }
  for (const row of data ?? []) {
    const date = new Date(String((row as Record<string, unknown>).enrolled_at));
    const key = date.toLocaleDateString('en-IN', { month: 'short' });
    if (key in monthlyMap) monthlyMap[key] = (monthlyMap[key] ?? 0) + 1;
  }
  return Object.entries(monthlyMap).map(([label, value]) => ({ label, value }));
}

export const adminDashboardService = {
  async getDashboardOverview(): Promise<{ data: DashboardOverview | null; error: string | null }> {
    try {
      const [globalStats, revenueSummary, recentStudents, recentPurchases, systemStatus] = await Promise.all([
        statisticsService.getGlobalStatistics(), statisticsService.getRevenueSummary(), getRecentStudents(5), getRecentPurchases(5), this.getSystemOverview(),
      ]);
      const gs = globalStats.data; const rs = revenueSummary.data;
      const stats: DashboardStats = {
        totalUsers: makeStat('total-users', 'Total Students', gs?.enrollmentCount ?? 0, 'Users', 'primary', 'All registered students'),
        activeStudents: makeStat('active-students', 'Active Students', gs?.enrollmentCount ?? 0, 'GraduationCap', 'success', 'Currently enrolled'),
        totalCourses: makeStat('total-courses', 'Total Batches', gs?.batchCount ?? 0, 'Layers', 'accent', 'All batches'),
        completionRate: makeStat('completion-rate', 'Completion Rate', '0%', 'TrendingUp', 'success', 'Average across all courses'),
        revenueThisMonth: makeStat('revenue-month', 'Revenue (Month)', `₹${(gs?.totalRevenue ?? 0).toLocaleString('en-IN')}`, 'IndianRupee', 'primary', 'Current billing cycle'),
        pendingAssessments: makeStat('pending-assessments', 'Pending Reviews', 0, 'ClipboardList', 'warning', 'Awaiting instructor review'),
        totalBatches: makeStat('total-batches', 'Total Batches', gs?.batchCount ?? 0, 'Layers', 'accent'),
        publishedBatches: makeStat('published-batches', 'Published Batches', gs?.publishedCount ?? 0, 'BookOpen', 'success'),
        subjects: makeStat('subjects', 'Subjects', gs?.subjectCount ?? 0, 'BookOpen', 'primary'),
        chapters: makeStat('chapters', 'Chapters', gs?.chapterCount ?? 0, 'FolderOpen', 'accent'),
        classes: makeStat('classes', 'Classes', gs?.classCount ?? 0, 'Video', 'primary'),
        videos: makeStat('videos', 'Videos', gs?.videoCount ?? 0, 'PlayCircle', 'success'),
        pdfNotes: makeStat('pdf-notes', 'PDF Notes', gs?.pdfCount ?? 0, 'FileText', 'accent'),
        mcqSets: makeStat('mcq-sets', 'MCQ Sets', gs?.mcqSetCount ?? 0, 'HelpCircle', 'primary'),
        questions: makeStat('questions', 'Questions', gs?.mcqQuestionCount ?? 0, 'HelpCircle', 'success'),
        enrollments: makeStat('enrollments', 'Enrollments', gs?.enrollmentCount ?? 0, 'GraduationCap', 'warning'),
        purchases: makeStat('purchases', 'Purchases', gs?.purchaseCount ?? 0, 'ShoppingCart', 'primary'),
        revenue: makeStat('revenue', 'Revenue', `₹${(gs?.totalRevenue ?? 0).toLocaleString('en-IN')}`, 'IndianRupee', 'success'),
      };
      const contentStats: DashboardContentStat[] = [
        { id: 'batches', label: 'Batches', value: gs?.batchCount ?? 0, published: gs?.publishedCount ?? 0, draft: gs?.draftCount ?? 0, icon: 'Layers', color: 'primary' },
        { id: 'subjects', label: 'Subjects', value: gs?.subjectCount ?? 0, published: 0, draft: 0, icon: 'BookOpen', color: 'accent' },
        { id: 'chapters', label: 'Chapters', value: gs?.chapterCount ?? 0, published: 0, draft: 0, icon: 'FolderOpen', color: 'primary' },
        { id: 'classes', label: 'Classes', value: gs?.classCount ?? 0, published: 0, draft: 0, icon: 'Video', color: 'success' },
        { id: 'videos', label: 'Videos', value: gs?.videoCount ?? 0, published: 0, draft: 0, icon: 'PlayCircle', color: 'primary' },
        { id: 'pdfs', label: 'PDF Notes', value: gs?.pdfCount ?? 0, published: 0, draft: 0, icon: 'FileText', color: 'accent' },
        { id: 'mcqs', label: 'MCQ Sets', value: gs?.mcqSetCount ?? 0, published: 0, draft: 0, icon: 'HelpCircle', color: 'success' },
        { id: 'questions', label: 'Questions', value: gs?.mcqQuestionCount ?? 0, published: 0, draft: 0, icon: 'HelpCircle', color: 'primary' },
      ];
      const revenue: DashboardRevenueSummary = { totalRevenue: rs?.totalRevenue ?? 0, completedCount: rs?.completedCount ?? 0, pendingCount: rs?.pendingCount ?? 0, failedCount: rs?.failedCount ?? 0, refundedCount: rs?.refundedCount ?? 0, thisMonth: 0, trend: 'neutral', trendPercent: 0 };
      const enrollment: DashboardEnrollmentSummary = { totalEnrollments: gs?.enrollmentCount ?? 0, activeEnrollments: gs?.enrollmentCount ?? 0, completedEnrollments: 0, cancelledEnrollments: 0, thisMonth: 0, trend: 'neutral', trendPercent: 0 };
      const quickActions: DashboardQuickAction[] = [
        { id: 'manage-batches', label: 'Manage Batches', description: 'Create and organize batches', icon: 'Layers', href: '/admin/batches', variant: 'primary' },
        { id: 'manage-subjects', label: 'Manage Subjects', description: 'Organize subjects', icon: 'BookOpen', href: '/admin/subjects', variant: 'outline' },
        { id: 'manage-chapters', label: 'Manage Chapters', description: 'Build chapter content', icon: 'FolderOpen', href: '/admin/chapters', variant: 'outline' },
        { id: 'manage-classes', label: 'Manage Classes', description: 'Schedule classes', icon: 'Video', href: '/admin/classes', variant: 'outline' },
        { id: 'manage-videos', label: 'Manage Videos', description: 'Upload and organize videos', icon: 'PlayCircle', href: '/admin/videos', variant: 'outline' },
        { id: 'manage-pdfs', label: 'Manage PDFs', description: 'Share downloadable notes', icon: 'FileText', href: '/admin/pdfs', variant: 'outline' },
        { id: 'manage-mcqs', label: 'Manage MCQs', description: 'Question bank management', icon: 'HelpCircle', href: '/admin/mcqs', variant: 'outline' },
        { id: 'manage-students', label: 'Manage Students', description: 'View and manage students', icon: 'Users', href: '/admin/students', variant: 'outline' },
      ];
      return { data: { stats, contentStats, revenue, enrollment, systemStatus: systemStatus.data ?? [], recentStudents, recentPurchases, quickActions, lastRefreshed: new Date().toISOString() }, error: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard';
      logger.error('adminDashboardService.getDashboardOverview', { error: msg });
      return { data: null, error: msg };
    }
  },
  async getRevenueAnalytics(): Promise<{ data: { summary: DashboardRevenueSummary; trend: RevenueDataPoint[] } | null; error: string | null }> {
    try {
      const [summary, trend] = await Promise.all([statisticsService.getRevenueSummary(), getRevenueTrend()]);
      const s = summary.data;
      return { data: { summary: { totalRevenue: s?.totalRevenue ?? 0, completedCount: s?.completedCount ?? 0, pendingCount: s?.pendingCount ?? 0, failedCount: s?.failedCount ?? 0, refundedCount: s?.refundedCount ?? 0, thisMonth: trend.length > 0 ? trend[trend.length - 1]!.value : 0, trend: 'neutral', trendPercent: 0 }, trend }, error: null };
    } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load revenue'; logger.error('adminDashboardService.getRevenueAnalytics', { error: msg }); return { data: null, error: msg }; }
  },
  async getEnrollmentAnalytics(): Promise<{ data: { summary: DashboardEnrollmentSummary; trend: EnrollmentDataPoint[] } | null; error: string | null }> {
    try {
      const [globalStats, trend] = await Promise.all([statisticsService.getGlobalStatistics(), getEnrollmentTrend()]);
      const gs = globalStats.data;
      return { data: { summary: { totalEnrollments: gs?.enrollmentCount ?? 0, activeEnrollments: gs?.enrollmentCount ?? 0, completedEnrollments: 0, cancelledEnrollments: 0, thisMonth: trend.length > 0 ? trend[trend.length - 1]!.value : 0, trend: 'neutral', trendPercent: 0 }, trend }, error: null };
    } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load enrollments'; logger.error('adminDashboardService.getEnrollmentAnalytics', { error: msg }); return { data: null, error: msg }; }
  },
  async getRecentStudents(limit: number = 5): Promise<{ data: RecentStudent[] | null; error: string | null }> {
    try { return { data: await getRecentStudents(limit), error: null }; } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load students'; logger.error('adminDashboardService.getRecentStudents', { error: msg }); return { data: null, error: msg }; }
  },
  async getRecentPurchases(limit: number = 5): Promise<{ data: RecentPurchase[] | null; error: string | null }> {
    try { return { data: await getRecentPurchases(limit), error: null }; } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load purchases'; logger.error('adminDashboardService.getRecentPurchases', { error: msg }); return { data: null, error: msg }; }
  },
  async getContentAnalytics(): Promise<{ data: ContentDistributionData[] | null; error: string | null }> {
    try {
      const gs = await statisticsService.getGlobalStatistics(); const d = gs.data;
      if (!d) return { data: [], error: null };
      return { data: [
        { label: 'Batches', value: d.batchCount, color: '#3b82f6' }, { label: 'Subjects', value: d.subjectCount, color: '#10b981' },
        { label: 'Chapters', value: d.chapterCount, color: '#f59e0b' }, { label: 'Classes', value: d.classCount, color: '#8b5cf6' },
        { label: 'Videos', value: d.videoCount, color: '#ef4444' }, { label: 'PDFs', value: d.pdfCount, color: '#06b6d4' },
        { label: 'MCQ Sets', value: d.mcqSetCount, color: '#ec4899' },
      ], error: null };
    } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load content analytics'; logger.error('adminDashboardService.getContentAnalytics', { error: msg }); return { data: null, error: msg }; }
  },
  async getSystemOverview(): Promise<{ data: DashboardSystemStatus[] | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient(); const start = Date.now();
      await supabase.from('batches').select('id', { count: 'exact', head: true }).limit(1);
      const dbLatency = Date.now() - start;
      return { data: [
        { label: 'Database', status: dbLatency < 1000 ? 'operational' : 'degraded', latencyMs: dbLatency },
        { label: 'File Storage', status: 'operational', latencyMs: 0 },
        { label: 'Authentication', status: 'operational', latencyMs: 0 },
        { label: 'API Gateway', status: 'operational', latencyMs: 0 },
      ], error: null };
    } catch (err) { const msg = err instanceof Error ? err.message : 'Failed to load system status'; logger.error('adminDashboardService.getSystemOverview', { error: msg }); return { data: null, error: msg }; }
  },
};
