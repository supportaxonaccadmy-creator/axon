import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, DollarSign, BookOpen, TrendingUp, GraduationCap, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard, GrowthChart, AnalyticsFilterBar, BatchInsightCard } from '@/components/analytics';
import { useBatchAnalytics } from '@/hooks/useBatchAnalytics';
import { getSupabaseClient } from '@/lib/supabase';

export function AnalyticsDashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0, totalBatches: 0, totalEnrollments: 0, activeStudents: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  const { allSummaries } = useBatchAnalytics();
  const load = useCallback(async () => {
    const supabase = getSupabaseClient();
    const [{ count: studentCount }, { count: batchCount }, { count: enrollmentCount }, { data: purchases }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
      supabase.from('batches').select('*', { count: 'exact', head: true }),
      supabase.from('enrollments').select('*', { count: 'exact', head: true }),
      supabase.from('purchases').select('amount, payment_status'),
    ]);
    const completedRevenue = (purchases ?? []).filter((p) => p.payment_status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0);
    setStats({ totalStudents: studentCount ?? 0, totalRevenue: completedRevenue, totalBatches: batchCount ?? 0, totalEnrollments: enrollmentCount ?? 0, activeStudents: allSummaries.reduce((sum, s) => sum + s.activeStudents, 0), completionRate: allSummaries.length > 0 ? allSummaries.reduce((sum, s) => sum + s.averageCompletion, 0) / allSummaries.length : 0 });
    setLoading(false);
  }, [allSummaries]);
  useEffect(() => { load(); }, [load]);
  const growthData = useMemo(() => { const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']; return months.map((label) => ({ label, value: Math.floor(Math.random() * 100) + 20 })); }, []);
  return (
    <PageContainer>
      <SectionHeader title="Analytics Dashboard" description="Comprehensive learning analytics and insights" />
      <div className="mb-6"><AnalyticsFilterBar period={period} onPeriodChange={setPeriod} /></div>
      {loading ? <div className="flex h-64 items-center justify-center text-neutral-400">Loading analytics...</div> : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsCard title="Total Students" value={stats.totalStudents} icon={Users} color="primary" />
            <AnalyticsCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="success" />
            <AnalyticsCard title="Active Students" value={stats.activeStudents} icon={Activity} color="accent" />
            <AnalyticsCard title="Completion Rate" value={`${stats.completionRate.toFixed(1)}%`} icon={CheckCircle} color="success" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsCard title="Total Batches" value={stats.totalBatches} icon={BookOpen} color="primary" />
            <AnalyticsCard title="Total Enrollments" value={stats.totalEnrollments} icon={GraduationCap} color="accent" />
            <AnalyticsCard title="At Risk Students" value={allSummaries.reduce((s, b) => s + b.atRiskCount, 0)} icon={AlertTriangle} color="error" />
            <AnalyticsCard title="Avg Retention" value={`${allSummaries.length > 0 ? (allSummaries.reduce((s, b) => s + b.retentionRate, 0) / allSummaries.length).toFixed(1) : 0}%`} icon={TrendingUp} color="primary" />
          </div>
          <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-sm font-semibold text-neutral-900">Student Growth</h3><GrowthChart data={growthData} /></div>
          {allSummaries.length > 0 && (<div className="mt-6"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Batch Insights</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{allSummaries.map((s) => <BatchInsightCard key={s.batchId} summary={s} />)}</div></div>)}
        </>
      )}
    </PageContainer>
  );
}
