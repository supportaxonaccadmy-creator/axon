import { Stethoscope, RefreshCw, Info } from 'lucide-react';
import { useProfileDisplayName } from '@/hooks/useProfile';
import { useAuthorizationContext } from '@/contexts/AuthorizationContext';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { RevenueCard } from '@/components/dashboard/RevenueCard';
import { EnrollmentCard } from '@/components/dashboard/EnrollmentCard';
import { RecentStudentCard } from '@/components/dashboard/RecentStudentCard';
import { RecentPurchaseCard } from '@/components/dashboard/RecentPurchaseCard';
import { ContentOverviewCard } from '@/components/dashboard/ContentOverviewCard';
import { SystemHealthCard } from '@/components/dashboard/SystemHealthCard';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { EnrollmentChart } from '@/components/dashboard/EnrollmentChart';
import { ContentDistributionChart } from '@/components/dashboard/ContentDistributionChart';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InfoCard } from '@/components/dashboard/InfoCard';
import { APP_CONFIG } from '@/constants/app';
import { format } from 'date-fns';

function WelcomeBanner({ displayName }: { displayName: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return (
    <div className="relative overflow-hidden rounded-xl border border-primary-200 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 shadow-sm">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div><p className="text-sm font-medium text-primary-200">{greeting}</p><h1 className="mt-0.5 text-xl font-bold text-white">{displayName}</h1><p className="mt-1 text-sm text-primary-200">{format(new Date(), "EEEE, MMMM d, yyyy")} &mdash; Admin Dashboard</p></div>
        <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10"><Stethoscope className="h-7 w-7 text-white" strokeWidth={1.5} /></div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" /><div className="pointer-events-none absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5" />
    </div>
  );
}

function StatsSkeletons() { return <>{Array.from({ length: 14 }).map((_, i) => (<div key={i} className="h-28 rounded-xl border border-neutral-200 bg-white animate-pulse" />))}</>; }

export function DashboardPage() {
  const displayName = useProfileDisplayName();
  const { role } = useAuthorizationContext();
  const { overview, revenueTrend, enrollmentTrend, contentDistribution, loading, error, refresh } = useAdminDashboard();
  const stats = overview?.stats;
  const statsList = stats ? Object.values(stats) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeBanner displayName={displayName} />
      {error && (<div className="flex items-center justify-between rounded-lg border border-error-200 bg-error-50 px-4 py-3"><p className="text-sm text-error-700">Failed to load dashboard data. Please try again.</p><Button variant="outline" size="sm" onClick={refresh} className="shrink-0"><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Retry</Button></div>)}
      <DashboardSection title="Platform Overview" description="Key metrics across your LMS" action={!loading && overview && (<div className="flex items-center gap-2"><span className="text-xs text-neutral-400">Updated {format(new Date(overview.lastRefreshed), 'h:mm a')}</span><button onClick={refresh} title="Refresh" className="text-neutral-400 hover:text-neutral-600 transition-colors" aria-label="Refresh dashboard"><RefreshCw className="h-3.5 w-3.5" /></button></div>)}>
        <DashboardGrid cols={4}>{loading ? <StatsSkeletons /> : statsList.map((stat) => <AnalyticsCard key={stat.id} stat={stat} />)}</DashboardGrid>
      </DashboardSection>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><RevenueCard summary={overview?.revenue ?? null} loading={loading} /><EnrollmentCard summary={overview?.enrollment ?? null} loading={loading} /></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><RevenueChart data={revenueTrend} loading={loading} /><EnrollmentChart data={enrollmentTrend} loading={loading} /></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><ContentOverviewCard stats={overview?.contentStats ?? []} loading={loading} /><ContentDistributionChart data={contentDistribution} loading={loading} /></div>
      <DashboardSection title="Quick Actions" description="Jump to management tasks">{loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => (<div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />))}</div> : <QuickActionsPanel actions={overview?.quickActions ?? []} />}</DashboardSection>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><RecentStudentCard students={overview?.recentStudents ?? []} loading={loading} /><RecentPurchaseCard purchases={overview?.recentPurchases ?? []} loading={loading} /></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3"><div className="lg:col-span-2"><SystemHealthCard items={overview?.systemStatus ?? []} loading={loading} /></div><InfoCard title="Account Info" icon={<Info className="h-4 w-4" />}><div className="space-y-2 text-sm"><div className="flex items-center justify-between"><span className="text-neutral-500">Name</span><span className="font-medium text-neutral-800">{displayName}</span></div><div className="flex items-center justify-between"><span className="text-neutral-500">Role</span><Badge variant="primary" className="capitalize">{role ?? '—'}</Badge></div><div className="flex items-center justify-between"><span className="text-neutral-500">Version</span><span className="font-medium text-neutral-800 tabular-nums">v{APP_CONFIG.version}</span></div></div></InfoCard></div>
    </div>
  );
}
