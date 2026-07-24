import { Stethoscope, RefreshCw, Info, Sparkles } from 'lucide-react';
import { useProfileDisplayName } from '@/hooks/useProfile';
import { useAuthorizationContext } from '@/contexts/AuthorizationContext';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityCard } from '@/components/dashboard/ActivityCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { InfoCard } from '@/components/dashboard/InfoCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { APP_CONFIG } from '@/constants/app';
import { format } from 'date-fns';
import type { DashboardUpcomingModule } from '@/types/dashboard';

const UPCOMING_MODULES: DashboardUpcomingModule[] = [
  { id: 'batches', label: 'Batch Management', icon: 'Layers', description: 'Create and manage student batches', status: 'planned' },
  { id: 'subjects', label: 'Subject Management', icon: 'BookOpen', description: 'Organize nursing subjects', status: 'planned' },
  { id: 'chapters', label: 'Chapter Builder', icon: 'FileText', description: 'Structured chapter content', status: 'planned' },
  { id: 'classes', label: 'Class Sessions', icon: 'Video', description: 'Schedule and manage classes', status: 'planned' },
  { id: 'videos', label: 'Video Library', icon: 'PlayCircle', description: 'Upload and organize videos', status: 'planned' },
  { id: 'pdf-notes', label: 'PDF Notes', icon: 'FileText', description: 'Share downloadable notes', status: 'planned' },
  { id: 'mcqs', label: 'MCQ Bank', icon: 'HelpCircle', description: 'Question bank management', status: 'planned' },
  { id: 'test-series', label: 'Test Series', icon: 'ClipboardList', description: 'Build mock test series', status: 'planned' },
  { id: 'live-classes', label: 'Live Classes', icon: 'Radio', description: 'Interactive live sessions', status: 'planned' },
  { id: 'payments', label: 'Payments', icon: 'CreditCard', description: 'Track and manage payments', status: 'planned' },
  { id: 'announcements', label: 'Announcements', icon: 'Megaphone', description: 'Broadcast to students', status: 'planned' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', description: 'Deep platform insights', status: 'in-progress' },
];

const STATUS_LABELS: Record<DashboardUpcomingModule['status'], string> = {
  planned: 'Planned',
  'in-progress': 'In Progress',
  'coming-soon': 'Coming Soon',
};

const STATUS_VARIANTS: Record<DashboardUpcomingModule['status'], 'default' | 'primary' | 'warning'> = {
  planned: 'default',
  'in-progress': 'warning',
  'coming-soon': 'primary',
};

function WelcomeBanner({ displayName }: { displayName: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary-200 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5 shadow-sm">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary-200">{greeting}</p>
          <h1 className="mt-0.5 text-xl font-bold text-white">{displayName}</h1>
          <p className="mt-1 text-sm text-primary-200">
            {format(new Date(), "EEEE, MMMM d, yyyy")} &mdash; Admin Dashboard
          </p>
        </div>
        <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10">
          <Stethoscope className="h-7 w-7 text-white" strokeWidth={1.5} />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5" />
    </div>
  );
}

function StatsSkeletons() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl border border-neutral-200 bg-white animate-pulse" />
      ))}
    </>
  );
}

export function DashboardPage() {
  const displayName = useProfileDisplayName();
  const { role } = useAuthorizationContext();
  const { data: summary, loading, error, refresh } = useDashboard();

  const stats = summary?.stats;
  const statsList = stats ? Object.values(stats) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeBanner displayName={displayName} />

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-error-200 bg-error-50 px-4 py-3">
          <p className="text-sm text-error-700">Failed to load dashboard data. Please try again.</p>
          <Button variant="outline" size="sm" onClick={refresh} className="shrink-0">
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry
          </Button>
        </div>
      )}

      <DashboardSection
        title="Overview"
        description="Key metrics across your platform"
        action={
          !loading && summary && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">
                Updated {format(new Date(summary.lastRefreshed), 'h:mm a')}
              </span>
              <button onClick={refresh} title="Refresh" className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        }
      >
        <DashboardGrid cols={3}>
          {loading ? <StatsSkeletons /> : statsList.map((stat) => <StatCard key={stat.id} stat={stat} />)}
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection title="Quick Actions" description="Common administrative tasks">
        <DashboardGrid cols={2}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />
              ))
            : (summary?.quickActions ?? []).map((action) => (
                <QuickActionCard key={action.id} action={action} />
              ))}
        </DashboardGrid>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardSection title="Recent Activity" description="Latest events across the platform">
            <ActivityCard
              activities={summary?.recentActivity ?? []}
              loading={loading}
            />
          </DashboardSection>
        </div>
        <div className="space-y-6">
          <DashboardSection title="System Status">
            {loading ? (
              <div className="h-48 rounded-xl border border-neutral-200 bg-white animate-pulse" />
            ) : (
              <StatusCard items={summary?.systemStatus ?? []} />
            )}
          </DashboardSection>
          <DashboardSection title="Account Info">
            <InfoCard title="Current User" icon={<Info className="h-4 w-4" />}>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Name</span>
                  <span className="font-medium text-neutral-800">{displayName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Role</span>
                  <Badge variant="primary" className="capitalize">{role ?? '—'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Version</span>
                  <span className="font-medium text-neutral-800 tabular-nums">v{APP_CONFIG.version}</span>
                </div>
              </div>
            </InfoCard>
          </DashboardSection>
        </div>
      </div>

      <DashboardSection title="Upcoming Modules" description="Features planned for upcoming phases">
        <DashboardGrid cols={3}>
          {UPCOMING_MODULES.map((mod) => (
            <div
              key={mod.id}
              className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Sparkles className="h-4 w-4 text-neutral-400" />
                <Badge variant={STATUS_VARIANTS[mod.status]}>{STATUS_LABELS[mod.status]}</Badge>
              </div>
              <p className="text-sm font-semibold text-neutral-800">{mod.label}</p>
              <p className="text-xs text-neutral-500 leading-relaxed">{mod.description}</p>
            </div>
          ))}
        </DashboardGrid>
      </DashboardSection>
    </div>
  );
}
