import { useState, useCallback, useEffect, useMemo } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { statisticsService } from '@/services/lms/statisticsService';
import { batchService } from '@/services/lms/batchService';
import { subjectService } from '@/services/lms/subjectService';
import { chapterService } from '@/services/lms/chapterService';
import { purchaseService } from '@/services/lms/purchaseService';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { mcqService } from '@/services/lms/mcqService';
import type { Batch, Subject, Chapter } from '@/types/lms';
import type {
  ReportFilters, ReportPeriod, RevenueReportData, EnrollmentReportData,
  StudentGrowthReportData, ContentPerformanceReportData, PurchaseReportData,
  McqAttemptReportData, ReportSummary,
} from '@/types/reports';

const DEFAULT_FILTERS: ReportFilters = {
  period: 'monthly', dateFrom: '', dateTo: '', batchId: '', subjectId: '',
  chapterId: '', classId: '', studentId: '', paymentStatus: '', enrollmentStatus: '',
};

interface ProfileRow { id: string; full_name: string | null; email: string | null; is_active: boolean; created_at: string; role: string; }

function getMonthsBack(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-IN', { month: 'short' }));
  }
  return months;
}

function getDaysBack(n: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
  }
  return days;
}

function getWeeksBack(n: number): string[] {
  const weeks: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    weeks.push(`W${n - i}`);
  }
  return weeks;
}

function getLabels(period: ReportPeriod): string[] {
  if (period === 'daily') return getDaysBack(14);
  if (period === 'weekly') return getWeeksBack(8);
  return getMonthsBack(6);
}

function filterByDate(createdAt: string, filters: ReportFilters): boolean {
  if (!filters.dateFrom && !filters.dateTo) return true;
  const date = new Date(createdAt);
  if (filters.dateFrom && date < new Date(filters.dateFrom)) return false;
  if (filters.dateTo && date > new Date(filters.dateTo + 'T23:59:59')) return false;
  return true;
}

export function useAdminReports() {
  const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ReportSummary>({
    globalStats: null, revenue: null, enrollments: null, studentGrowth: null,
    contentPerformance: null, purchases: null, mcqAttempts: null,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const [batchRes, subjRes, chapRes, globalStats] = await Promise.all([
        batchService.list(), subjectService.list(), chapterService.list(), statisticsService.getGlobalStatistics(),
      ]);
      setBatches(batchRes.data ?? []);
      setSubjects(subjRes.data ?? []);
      setChapters(chapRes.data ?? []);

      const labels = getLabels(filters.period);
      const batchMap = new Map((batchRes.data ?? []).map((b) => [b.id, b]));

      const [allPurchases, allEnrollments] = await Promise.all([
        purchaseService.list({ paymentStatus: filters.paymentStatus ? (filters.paymentStatus as never) : undefined }),
        enrollmentService.list(filters.enrollmentStatus && filters.enrollmentStatus !== 'all' ? { accessStatus: filters.enrollmentStatus as never } : undefined),
      ]);

      const filteredPurchases = (allPurchases.data ?? []).filter((p) => {
        if (filters.batchId && p.batchId !== filters.batchId) return false;
        if (filters.studentId && p.profileId !== filters.studentId) return false;
        return filterByDate(p.purchasedAt, filters);
      });
      const filteredEnrollments = (allEnrollments.data ?? []).filter((e) => {
        if (filters.batchId && e.batchId !== filters.batchId) return false;
        if (filters.studentId && e.profileId !== filters.studentId) return false;
        return filterByDate(e.enrolledAt, filters);
      });

      const totalRevenue = filteredPurchases.filter((p) => p.paymentStatus === 'completed').reduce((sum, p) => sum + p.amount, 0);
      const completedCount = filteredPurchases.filter((p) => p.paymentStatus === 'completed').length;
      const pendingCount = filteredPurchases.filter((p) => p.paymentStatus === 'pending').length;
      const failedCount = filteredPurchases.filter((p) => p.paymentStatus === 'failed').length;
      const refundedCount = filteredPurchases.filter((p) => p.paymentStatus === 'refunded').length;

      const revenueByLabel: Record<string, number> = {};
      labels.forEach((l) => { revenueByLabel[l] = 0; });
      for (const p of filteredPurchases) {
        if (p.paymentStatus !== 'completed') continue;
        const date = new Date(p.purchasedAt);
        const key = filters.period === 'daily'
          ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : filters.period === 'weekly'
            ? `W${Math.ceil((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1}`
            : date.toLocaleDateString('en-IN', { month: 'short' });
        if (key in revenueByLabel) revenueByLabel[key] = (revenueByLabel[key] ?? 0) + p.amount;
      }
      const revenueTrend = labels.map((l) => ({ label: l, value: revenueByLabel[l] ?? 0 }));

      const batchRevenueMap = new Map<string, { revenue: number; count: number }>();
      for (const p of filteredPurchases) {
        if (p.paymentStatus !== 'completed') continue;
        const existing = batchRevenueMap.get(p.batchId) ?? { revenue: 0, count: 0 };
        batchRevenueMap.set(p.batchId, { revenue: existing.revenue + p.amount, count: existing.count + 1 });
      }
      const batchWiseRevenue = Array.from(batchRevenueMap.entries()).map(([batchId, data]) => ({
        batchId, batchTitle: batchMap.get(batchId)?.title ?? 'Unknown', revenue: data.revenue, count: data.count,
      })).sort((a, b) => b.revenue - a.revenue);

      const revenueReport: RevenueReportData = {
        totalRevenue, completedCount, pendingCount, failedCount, refundedCount,
        trend: revenueTrend, batchWise: batchWiseRevenue,
      };

      const enrollmentByLabel: Record<string, number> = {};
      labels.forEach((l) => { enrollmentByLabel[l] = 0; });
      for (const e of filteredEnrollments) {
        const date = new Date(e.enrolledAt);
        const key = filters.period === 'daily'
          ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : filters.period === 'weekly'
            ? `W${Math.ceil((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1}`
            : date.toLocaleDateString('en-IN', { month: 'short' });
        if (key in enrollmentByLabel) enrollmentByLabel[key] = (enrollmentByLabel[key] ?? 0) + 1;
      }
      const enrollmentTrend = labels.map((l) => ({ label: l, value: enrollmentByLabel[l] ?? 0 }));

      const batchEnrollmentMap = new Map<string, number>();
      for (const e of filteredEnrollments) {
        batchEnrollmentMap.set(e.batchId, (batchEnrollmentMap.get(e.batchId) ?? 0) + 1);
      }
      const batchWiseEnrollment = Array.from(batchEnrollmentMap.entries()).map(([batchId, count]) => ({
        batchId, batchTitle: batchMap.get(batchId)?.title ?? 'Unknown', count,
      })).sort((a, b) => b.count - a.count);

      const enrollmentReport: EnrollmentReportData = {
        totalEnrollments: filteredEnrollments.length,
        activeCount: filteredEnrollments.filter((e) => e.accessStatus === 'active').length,
        expiredCount: filteredEnrollments.filter((e) => e.accessStatus === 'expired').length,
        cancelledCount: filteredEnrollments.filter((e) => e.accessStatus === 'cancelled').length,
        trend: enrollmentTrend, batchWise: batchWiseEnrollment,
      };

      const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'student');
      const profileRows = (profiles as ProfileRow[] | null) ?? [];
      const now = new Date();
      const newThisMonth = profileRows.filter((p) => {
        const d = new Date(p.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      const studentByLabel: Record<string, number> = {};
      labels.forEach((l) => { studentByLabel[l] = 0; });
      for (const p of profileRows) {
        const date = new Date(p.created_at);
        const key = filters.period === 'daily'
          ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : filters.period === 'weekly'
            ? `W${Math.ceil((Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000)) || 1}`
            : date.toLocaleDateString('en-IN', { month: 'short' });
        if (key in studentByLabel) studentByLabel[key] = (studentByLabel[key] ?? 0) + 1;
      }
      const studentTrend = labels.map((l) => ({ label: l, value: studentByLabel[l] ?? 0 }));

      const studentGrowthReport: StudentGrowthReportData = {
        totalStudents: profileRows.length,
        activeStudents: profileRows.filter((p) => p.is_active).length,
        inactiveStudents: profileRows.filter((p) => !p.is_active).length,
        newThisMonth, trend: studentTrend,
      };

      const gs = globalStats.data;
      const contentPerformanceReport: ContentPerformanceReportData = {
        batchCount: gs?.batchCount ?? 0, subjectCount: gs?.subjectCount ?? 0, chapterCount: gs?.chapterCount ?? 0,
        classCount: gs?.classCount ?? 0, videoCount: gs?.videoCount ?? 0, pdfCount: gs?.pdfCount ?? 0,
        mcqSetCount: gs?.mcqSetCount ?? 0, mcqQuestionCount: gs?.mcqQuestionCount ?? 0,
        distribution: [
          { label: 'Batches', value: gs?.batchCount ?? 0, color: '#3b82f6' },
          { label: 'Subjects', value: gs?.subjectCount ?? 0, color: '#10b981' },
          { label: 'Chapters', value: gs?.chapterCount ?? 0, color: '#f59e0b' },
          { label: 'Classes', value: gs?.classCount ?? 0, color: '#8b5cf6' },
          { label: 'Videos', value: gs?.videoCount ?? 0, color: '#ef4444' },
          { label: 'PDFs', value: gs?.pdfCount ?? 0, color: '#06b6d4' },
          { label: 'MCQ Sets', value: gs?.mcqSetCount ?? 0, color: '#ec4899' },
        ],
      };

      const gatewayMap = new Map<string, { count: number; revenue: number }>();
      for (const p of filteredPurchases) {
        const existing = gatewayMap.get(p.gateway) ?? { count: 0, revenue: 0 };
        gatewayMap.set(p.gateway, { count: existing.count + 1, revenue: p.paymentStatus === 'completed' ? existing.revenue + p.amount : existing.revenue });
      }
      const profileIds = [...new Set(filteredPurchases.map((p) => p.profileId))];
      const { data: purchaseProfiles } = await supabase.from('profiles').select('*').in('id', profileIds);
      const profileNameMap = new Map((purchaseProfiles as ProfileRow[] | null ?? []).map((p) => [p.id, p.full_name ?? 'Unknown']));

      const purchaseReport: PurchaseReportData = {
        totalPurchases: filteredPurchases.length, totalRevenue,
        completedCount, pendingCount, failedCount, refundedCount,
        gatewayWise: Array.from(gatewayMap.entries()).map(([gateway, data]) => ({ gateway, count: data.count, revenue: data.revenue })).sort((a, b) => b.revenue - a.revenue),
        recent: filteredPurchases.slice(0, 10).map((p) => ({
          id: p.id, studentName: profileNameMap.get(p.profileId) ?? 'Unknown',
          batchTitle: batchMap.get(p.batchId)?.title ?? 'Unknown', amount: p.amount,
          status: p.paymentStatus, date: p.purchasedAt,
        })),
      };

      const { data: mcqSets } = await mcqService.listSets();
      const mcqSetsList = mcqSets ?? [];
      const topSetsData: Array<{ id: string; title: string; questionCount: number; status: string }> = [];
      for (const s of mcqSetsList.slice(0, 10)) {
        const { data: qs } = await mcqService.listQuestions(s.id);
        topSetsData.push({ id: s.id, title: s.title, questionCount: qs?.length ?? 0, status: s.status });
      }
      const mcqAttemptsReport: McqAttemptReportData = {
        totalMcqSets: mcqSetsList.length, totalQuestions: gs?.mcqQuestionCount ?? 0,
        publishedSets: mcqSetsList.filter((s) => s.status === 'published').length,
        draftSets: mcqSetsList.filter((s) => s.status === 'draft').length, topSets: topSetsData,
      };

      setSummary({
        globalStats: gs, revenue: revenueReport, enrollments: enrollmentReport,
        studentGrowth: studentGrowthReport, contentPerformance: contentPerformanceReport,
        purchases: purchaseReport, mcqAttempts: mcqAttemptsReport,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const updateFilter = useCallback((key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => { setFilters(DEFAULT_FILTERS); }, []);

  const filteredSubjects = useMemo(() => {
    if (!filters.batchId) return subjects;
    return subjects.filter((s) => s.batchId === filters.batchId);
  }, [subjects, filters.batchId]);

  const filteredChapters = useMemo(() => {
    if (!filters.subjectId) return chapters;
    return chapters.filter((c) => c.subjectId === filters.subjectId);
  }, [chapters, filters.subjectId]);

  return { filters, batches, subjects: filteredSubjects, chapters: filteredChapters, loading, error, summary, updateFilter, resetFilters, refresh: load };
}
