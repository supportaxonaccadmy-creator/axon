import { useState, useCallback, useMemo } from 'react';
import {
  DollarSign, TrendingUp, Users, BookOpen, ShoppingBag, HelpCircle,
  CheckCircle2, Clock, XCircle, ArrowUpRight, Layers, FileText, Video,
  RotateCcw,
} from 'lucide-react';
import { useAdminReports } from '@/hooks/useAdminReports';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { BarChart, LineChart, DonutChart, StatCard, ReportFiltersBar } from '@/components/admin/reports';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import type { ReportSummary } from '@/types/reports';

type Tab = 'overview' | 'revenue' | 'enrollment' | 'students' | 'content' | 'purchases' | 'mcq';

export function ReportsPage() {
  const { filters, batches, subjects, chapters, loading, error, summary, updateFilter, resetFilters, refresh } = useAdminReports();
  const [tab, setTab] = useState<Tab>('overview');

  const handleExportCSV = useCallback(() => {
    const rows: string[] = [];
    if (tab === 'revenue' && summary.revenue) {
      rows.push('Metric,Value');
      rows.push(`Total Revenue,${summary.revenue.totalRevenue}`);
      rows.push(`Completed,${summary.revenue.completedCount}`);
      rows.push(`Pending,${summary.revenue.pendingCount}`);
      rows.push(`Failed,${summary.revenue.failedCount}`);
      rows.push(`Refunded,${summary.revenue.refundedCount}`);
      rows.push('');
      rows.push('Batch,Revenue,Count');
      summary.revenue.batchWise.forEach((b) => rows.push(`${b.batchTitle},${b.revenue},${b.count}`));
    } else if (tab === 'enrollment' && summary.enrollments) {
      rows.push('Metric,Value');
      rows.push(`Total Enrollments,${summary.enrollments.totalEnrollments}`);
      rows.push(`Active,${summary.enrollments.activeCount}`);
      rows.push(`Expired,${summary.enrollments.expiredCount}`);
      rows.push(`Cancelled,${summary.enrollments.cancelledCount}`);
      rows.push('');
      rows.push('Batch,Count');
      summary.enrollments.batchWise.forEach((b) => rows.push(`${b.batchTitle},${b.count}`));
    } else if (tab === 'purchases' && summary.purchases) {
      rows.push('ID,Student,Batch,Amount,Status,Date');
      summary.purchases.recent.forEach((p) => rows.push(`${p.id},${p.studentName},${p.batchTitle},${p.amount},${p.status},${p.date}`));
    } else if (tab === 'students' && summary.studentGrowth) {
      rows.push('Metric,Value');
      rows.push(`Total Students,${summary.studentGrowth.totalStudents}`);
      rows.push(`Active,${summary.studentGrowth.activeStudents}`);
      rows.push(`Inactive,${summary.studentGrowth.inactiveStudents}`);
      rows.push(`New This Month,${summary.studentGrowth.newThisMonth}`);
    } else if (summary.globalStats) {
      rows.push('Metric,Value');
      rows.push(`Batches,${summary.globalStats.batchCount}`);
      rows.push(`Subjects,${summary.globalStats.subjectCount}`);
      rows.push(`Chapters,${summary.globalStats.chapterCount}`);
      rows.push(`Classes,${summary.globalStats.classCount}`);
      rows.push(`Videos,${summary.globalStats.videoCount}`);
      rows.push(`PDFs,${summary.globalStats.pdfCount}`);
      rows.push(`MCQ Sets,${summary.globalStats.mcqSetCount}`);
      rows.push(`Enrollments,${summary.globalStats.enrollmentCount}`);
      rows.push(`Purchases,${summary.globalStats.purchaseCount}`);
      rows.push(`Revenue,${summary.globalStats.totalRevenue}`);
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tab}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tab, summary]);

  const handlePrint = useCallback(() => { window.print(); }, []);

  const tabs: Array<{ key: Tab; label: string; icon: typeof DollarSign }> = useMemo(() => [
    { key: 'overview', label: 'Overview', icon: Layers },
    { key: 'revenue', label: 'Revenue', icon: DollarSign },
    { key: 'enrollment', label: 'Enrollment', icon: TrendingUp },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'content', label: 'Content', icon: BookOpen },
    { key: 'purchases', label: 'Purchases', icon: ShoppingBag },
    { key: 'mcq', label: 'MCQ', icon: HelpCircle },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="Enterprise reporting dashboard" actions={<Button variant="outline" size="sm" onClick={refresh}><RotateCcw className="h-3.5 w-3.5" />Refresh</Button>} />

      <ReportFiltersBar filters={filters} onFilterChange={updateFilter} onReset={resetFilters} batches={batches} subjects={subjects} chapters={chapters} onExportCSV={handleExportCSV} onPrint={handlePrint} />

      <div className="flex gap-2 border-b border-neutral-200 overflow-x-auto">
        {tabs.map((t) => { const Icon = t.icon; return (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors', tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700')}>
            <Icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ); })}
      </div>

      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : (
        <>
          {tab === 'overview' && <OverviewTab summary={summary} />}
          {tab === 'revenue' && summary.revenue && <RevenueTab data={summary.revenue} />}
          {tab === 'enrollment' && summary.enrollments && <EnrollmentTab data={summary.enrollments} />}
          {tab === 'students' && summary.studentGrowth && <StudentTab data={summary.studentGrowth} />}
          {tab === 'content' && summary.contentPerformance && <ContentTab data={summary.contentPerformance} />}
          {tab === 'purchases' && summary.purchases && <PurchaseTab data={summary.purchases} />}
          {tab === 'mcq' && summary.mcqAttempts && <McqTab data={summary.mcqAttempts} />}
        </>
      )}
    </div>
  );
}

function OverviewTab({ summary }: { summary: ReportSummary }) {
  const gs = summary.globalStats;
  if (!gs) return <EmptyState title="No data available" description="Global statistics are not loaded yet." icon={<Layers className="h-12 w-12" />} />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Total Revenue" value={`₹${gs.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-success-600 bg-success-50" />
        <StatCard label="Total Students" value={gs.enrollmentCount} icon={Users} color="text-primary-600 bg-primary-50" />
        <StatCard label="Batches" value={gs.batchCount} icon={Layers} color="text-accent-600 bg-accent-50" />
        <StatCard label="Enrollments" value={gs.enrollmentCount} icon={TrendingUp} color="text-warning-600 bg-warning-50" />
        <StatCard label="Purchases" value={gs.purchaseCount} icon={ShoppingBag} color="text-primary-600 bg-primary-50" />
        <StatCard label="MCQ Sets" value={gs.mcqSetCount} icon={HelpCircle} color="text-success-600 bg-success-50" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-neutral-800">Content Distribution</h3>
          {summary.contentPerformance && <DonutChart data={summary.contentPerformance.distribution} />}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-neutral-800">Revenue Trend</h3>
          {summary.revenue && <BarChart data={summary.revenue.trend} color="#10b981" formatValue={(v) => `₹${v.toLocaleString()}`} />}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-neutral-800">Enrollment Trend</h3>
          {summary.enrollments && <LineChart data={summary.enrollments.trend} color="#3b82f6" />}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-neutral-800">Student Growth</h3>
          {summary.studentGrowth && <LineChart data={summary.studentGrowth.trend} color="#8b5cf6" />}
        </div>
      </div>
    </div>
  );
}

function RevenueTab({ data }: { data: NonNullable<ReportSummary['revenue']> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-success-600 bg-success-50" />
        <StatCard label="Completed" value={data.completedCount} icon={CheckCircle2} color="text-success-600 bg-success-50" />
        <StatCard label="Pending" value={data.pendingCount} icon={Clock} color="text-warning-600 bg-warning-50" />
        <StatCard label="Failed" value={data.failedCount} icon={XCircle} color="text-error-600 bg-error-50" />
        <StatCard label="Refunded" value={data.refundedCount} icon={RotateCcw} color="text-neutral-500 bg-neutral-100" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Revenue Trend</h3>
        <BarChart data={data.trend} color="#10b981" formatValue={(v) => `₹${v.toLocaleString()}`} />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Batch Wise Revenue</h3>
        {data.batchWise.length === 0 ? <p className="text-sm text-neutral-500">No revenue data.</p> : (
          <div className="space-y-2">
            {data.batchWise.map((b) => (
              <div key={b.batchId} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3">
                <span className="text-sm font-medium text-neutral-900">{b.batchTitle}</span>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-xs">{b.count} sales</Badge>
                  <span className="text-sm font-bold text-success-600">₹{b.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EnrollmentTab({ data }: { data: NonNullable<ReportSummary['enrollments']> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Enrollments" value={data.totalEnrollments} icon={TrendingUp} color="text-primary-600 bg-primary-50" />
        <StatCard label="Active" value={data.activeCount} icon={CheckCircle2} color="text-success-600 bg-success-50" />
        <StatCard label="Expired" value={data.expiredCount} icon={Clock} color="text-warning-600 bg-warning-50" />
        <StatCard label="Cancelled" value={data.cancelledCount} icon={XCircle} color="text-error-600 bg-error-50" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Enrollment Trend</h3>
        <LineChart data={data.trend} color="#3b82f6" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Batch Wise Enrollment</h3>
        {data.batchWise.length === 0 ? <p className="text-sm text-neutral-500">No enrollment data.</p> : (
          <div className="space-y-2">
            {data.batchWise.map((b) => (
              <div key={b.batchId} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3">
                <span className="text-sm font-medium text-neutral-900">{b.batchTitle}</span>
                <Badge variant="primary" className="text-xs">{b.count} enrolled</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentTab({ data }: { data: NonNullable<ReportSummary['studentGrowth']> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Students" value={data.totalStudents} icon={Users} color="text-primary-600 bg-primary-50" />
        <StatCard label="Active" value={data.activeStudents} icon={CheckCircle2} color="text-success-600 bg-success-50" />
        <StatCard label="Inactive" value={data.inactiveStudents} icon={XCircle} color="text-neutral-500 bg-neutral-100" />
        <StatCard label="New This Month" value={data.newThisMonth} icon={ArrowUpRight} color="text-accent-600 bg-accent-50" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Student Growth Trend</h3>
        <LineChart data={data.trend} color="#8b5cf6" />
      </div>
    </div>
  );
}

function ContentTab({ data }: { data: NonNullable<ReportSummary['contentPerformance']> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <StatCard label="Batches" value={data.batchCount} icon={Layers} color="text-primary-600 bg-primary-50" />
        <StatCard label="Subjects" value={data.subjectCount} icon={BookOpen} color="text-accent-600 bg-accent-50" />
        <StatCard label="Chapters" value={data.chapterCount} icon={BookOpen} color="text-primary-600 bg-primary-50" />
        <StatCard label="Classes" value={data.classCount} icon={Video} color="text-success-600 bg-success-50" />
        <StatCard label="Videos" value={data.videoCount} icon={Video} color="text-primary-600 bg-primary-50" />
        <StatCard label="PDFs" value={data.pdfCount} icon={FileText} color="text-accent-600 bg-accent-50" />
        <StatCard label="MCQ Sets" value={data.mcqSetCount} icon={HelpCircle} color="text-success-600 bg-success-50" />
        <StatCard label="Questions" value={data.mcqQuestionCount} icon={HelpCircle} color="text-primary-600 bg-primary-50" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Content Distribution</h3>
        <DonutChart data={data.distribution} />
      </div>
    </div>
  );
}

function PurchaseTab({ data }: { data: NonNullable<ReportSummary['purchases']> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <StatCard label="Total Purchases" value={data.totalPurchases} icon={ShoppingBag} color="text-primary-600 bg-primary-50" />
        <StatCard label="Revenue" value={`₹${data.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-success-600 bg-success-50" />
        <StatCard label="Completed" value={data.completedCount} icon={CheckCircle2} color="text-success-600 bg-success-50" />
        <StatCard label="Pending" value={data.pendingCount} icon={Clock} color="text-warning-600 bg-warning-50" />
        <StatCard label="Failed" value={data.failedCount} icon={XCircle} color="text-error-600 bg-error-50" />
        <StatCard label="Refunded" value={data.refundedCount} icon={RotateCcw} color="text-neutral-500 bg-neutral-100" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Gateway Wise Distribution</h3>
        {data.gatewayWise.length === 0 ? <p className="text-sm text-neutral-500">No gateway data.</p> : (
          <div className="space-y-2">
            {data.gatewayWise.map((g) => (
              <div key={g.gateway} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3">
                <span className="text-sm font-medium capitalize text-neutral-900">{g.gateway}</span>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-xs">{g.count} purchases</Badge>
                  <span className="text-sm font-bold text-success-600">₹{g.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Recent Purchases</h3>
        {data.recent.length === 0 ? <p className="text-sm text-neutral-500">No recent purchases.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                <th className="pb-2">Student</th><th className="pb-2">Batch</th><th className="pb-2">Amount</th><th className="pb-2">Status</th><th className="pb-2">Date</th>
              </tr></thead>
              <tbody>
                {data.recent.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-900">{p.studentName}</td>
                    <td className="py-2 text-neutral-600">{p.batchTitle}</td>
                    <td className="py-2 font-medium text-neutral-900">₹{p.amount.toLocaleString()}</td>
                    <td className="py-2"><Badge variant={p.status === 'completed' ? 'success' : p.status === 'pending' ? 'warning' : p.status === 'failed' ? 'error' : 'default'} className="text-xs">{p.status}</Badge></td>
                    <td className="py-2 text-xs text-neutral-500">{format(new Date(p.date), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function McqTab({ data }: { data: NonNullable<ReportSummary['mcqAttempts']> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="MCQ Sets" value={data.totalMcqSets} icon={HelpCircle} color="text-primary-600 bg-primary-50" />
        <StatCard label="Questions" value={data.totalQuestions} icon={HelpCircle} color="text-success-600 bg-success-50" />
        <StatCard label="Published" value={data.publishedSets} icon={CheckCircle2} color="text-success-600 bg-success-50" />
        <StatCard label="Draft" value={data.draftSets} icon={Clock} color="text-warning-600 bg-warning-50" />
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-neutral-800">Top MCQ Sets</h3>
        {data.topSets.length === 0 ? <p className="text-sm text-neutral-500">No MCQ sets found.</p> : (
          <div className="space-y-2">
            {data.topSets.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3">
                <span className="text-sm font-medium text-neutral-900">{s.title}</span>
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="text-xs">{s.questionCount} questions</Badge>
                  <Badge variant={s.status === 'published' ? 'success' : 'default'} className="text-xs">{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
