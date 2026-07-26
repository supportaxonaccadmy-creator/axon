import { RefreshCw, BookOpen, Award, Target, HelpCircle } from 'lucide-react';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { WelcomeCard } from '@/components/student/dashboard/WelcomeCard';
import { ProfileSummaryCard } from '@/components/student/dashboard/ProfileSummaryCard';
import { BatchCard } from '@/components/student/dashboard/BatchCard';
import { ContinueLearningCard } from '@/components/student/dashboard/ContinueLearningCard';
import { ProgressCard } from '@/components/student/dashboard/ProgressCard';
import { StudentQuickActionCard } from '@/components/student/dashboard/StudentQuickActionCard';
import { RecentClassCard } from '@/components/student/dashboard/RecentClassCard';
import { AnnouncementCard } from '@/components/student/dashboard/AnnouncementCard';
import { LiveClassCard } from '@/components/student/dashboard/LiveClassCard';
import { StudentStatCard } from '@/components/student/dashboard/StudentStatCard';
import { StudentDashboardGrid } from '@/components/student/dashboard/StudentDashboardGrid';
import { StudentDashboardSection } from '@/components/student/dashboard/StudentDashboardSection';
import { EmptyDashboard } from '@/components/student/dashboard/EmptyDashboard';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

export function StudentDashboardPage() {
  const { data: summary, loading, error, refresh } = useStudentDashboard();

  if (loading) return <DashboardLoadingSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-error-200 bg-error-50 px-4 py-3">
        <p className="text-sm text-error-700">Failed to load dashboard data. Please try again.</p>
        <Button variant="outline" size="sm" onClick={refresh} className="shrink-0"><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry</Button>
      </div>
    );
  }

  if (!summary) return <EmptyDashboard />;

  const { batches, continueLearning, recentClasses, upcomingLiveClasses, announcements, progress, quickActions } = summary;

  return (
    <div className="space-y-6 animate-fade-in">
      <WelcomeCard />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <StudentDashboardSection title="Overview" description="Your learning at a glance" action={<div className="flex items-center gap-2"><span className="text-xs text-neutral-400">Updated {format(new Date(summary.lastRefreshed), 'h:mm a')}</span><button onClick={refresh} title="Refresh" className="text-neutral-400 hover:text-neutral-600 transition-colors"><RefreshCw className="h-3.5 w-3.5" /></button></div>}>
            <StudentDashboardGrid cols={4}>
              <StudentStatCard label="Purchased Batches" value={progress.purchasedBatches} icon={BookOpen} color="primary" />
              <StudentStatCard label="Completed Classes" value={progress.completedClasses} icon={Award} color="success" />
              <StudentStatCard label="Completion %" value={`${progress.completionPercent}%`} icon={Target} color="accent" />
              <StudentStatCard label="MCQs Attempted" value={progress.mcqAttempted} icon={HelpCircle} color="primary" />
            </StudentDashboardGrid>
          </StudentDashboardSection>
          <StudentDashboardSection title="Continue Learning" description="Pick up where you left off">
            {continueLearning.length > 0 ? (<div className="space-y-3">{continueLearning.slice(0, 4).map((item) => (<ContinueLearningCard key={item.id} item={item} />))}</div>) : (<EmptyDashboard title="No courses in progress" description="Start watching classes to see them here." actionLabel="Browse Batches" onAction={() => undefined} />)}
          </StudentDashboardSection>
          <StudentDashboardSection title="My Batches" description="Your enrolled batches">
            {batches.length > 0 ? (<StudentDashboardGrid cols={2}>{batches.slice(0, 4).map((batch) => (<BatchCard key={batch.id} batch={batch} />))}</StudentDashboardGrid>) : (<EmptyDashboard title="No batches enrolled" description="Enroll in a batch to start your learning journey." />)}
          </StudentDashboardSection>
          <StudentDashboardSection title="Recent Classes" description="Your recently accessed content">
            {recentClasses.length > 0 ? (<div className="space-y-2">{recentClasses.slice(0, 5).map((item) => (<RecentClassCard key={item.id} item={item} />))}</div>) : (<EmptyDashboard title="No recent activity" description="Your recently accessed classes will appear here." />)}
          </StudentDashboardSection>
        </div>
        <div className="space-y-6">
          <ProfileSummaryCard />
          <StudentDashboardSection title="Progress" description="Your learning metrics"><ProgressCard progress={progress} /></StudentDashboardSection>
          <StudentDashboardSection title="Upcoming Live Classes">
            {upcomingLiveClasses.length > 0 ? (<div className="space-y-3">{upcomingLiveClasses.slice(0, 3).map((cls) => (<LiveClassCard key={cls.id} liveClass={cls} />))}</div>) : (<EmptyDashboard title="No live classes scheduled" description="Upcoming live sessions will appear here." />)}
          </StudentDashboardSection>
          <StudentDashboardSection title="Announcements">
            {announcements.length > 0 ? (<div className="space-y-2">{announcements.slice(0, 3).map((a) => (<AnnouncementCard key={a.id} announcement={a} />))}</div>) : (<EmptyDashboard title="No announcements" description="Important updates will appear here." />)}
          </StudentDashboardSection>
        </div>
      </div>
      <StudentDashboardSection title="Quick Actions" description="Jump to what you need">
        <StudentDashboardGrid cols={4}>{quickActions.map((action) => (<StudentQuickActionCard key={action.id} action={action} />))}</StudentDashboardGrid>
      </StudentDashboardSection>
    </div>
  );
}
