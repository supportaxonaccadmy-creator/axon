import { useParams } from 'react-router-dom';
import { Layers, BookOpen, IndianRupee, CheckCircle2, Lock, PlayCircle, User } from 'lucide-react';
import { useBatchDetails } from '@/hooks/useBatchDetails';
import { LmsBreadcrumbs } from '@/components/student/lms/LmsBreadcrumbs';
import { SubjectCard } from '@/components/student/lms/SubjectCard';
import { StudentDashboardSection } from '@/components/student/dashboard/StudentDashboardSection';
import { EmptyDashboard } from '@/components/student/dashboard/EmptyDashboard';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function BatchDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { batch, tree, pricing, breadcrumbs, enrolled, loading, error, refresh } = useBatchDetails(slug);

  if (loading) return <DashboardLoadingSkeleton />;
  if (error || !batch) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3">
        <p className="text-sm text-error-700">{error ?? 'Batch not found'}</p>
        <button onClick={refresh} className="mt-2 text-xs text-primary-600 font-medium hover:underline">Retry</button>
      </div>
    );
  }

  const subjects = tree?.children ?? [];
  const displayPrice = pricing?.salePrice ?? pricing?.price ?? batch.discountPrice ?? batch.price;
  const isFree = pricing?.isFree ?? batch.isFree;

  return (
    <div className="space-y-6 animate-fade-in">
      <LmsBreadcrumbs items={breadcrumbs} />
      <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 shadow-sm">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10"><Layers className="h-6 w-6 text-white" strokeWidth={2} /></div>
              <div>
                <h1 className="text-xl font-bold text-white">{batch.title}</h1>
                <div className="mt-1 flex items-center gap-2">{enrolled ? <Badge variant="success">Enrolled</Badge> : isFree ? <Badge variant="primary">Free</Badge> : <Badge variant="warning">Locked</Badge>}{batch.status === 'published' && <Badge variant="info">Published</Badge>}</div>
              </div>
            </div>
            {batch.description && <p className="mt-3 max-w-2xl text-sm text-primary-200 leading-relaxed">{batch.description}</p>}
          </div>
          <div className="shrink-0">
            {enrolled ? (
              <Button variant="primary" size="md" className="bg-white text-primary-700 hover:bg-primary-50"><PlayCircle className="h-4 w-4" />Continue Learning</Button>
            ) : isFree ? (
              <Button variant="primary" size="md" className="bg-white text-primary-700 hover:bg-primary-50"><PlayCircle className="h-4 w-4" />Start Free</Button>
            ) : (
              <div className="rounded-lg bg-white/10 px-4 py-3 text-center"><p className="text-xs text-primary-200">Starting at</p><p className="text-lg font-bold text-white">₹{displayPrice}</p></div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><BookOpen className="h-5 w-5 text-primary-600" /><div><p className="text-lg font-bold text-neutral-900">{subjects.length}</p><p className="text-xs text-neutral-500">Subjects</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><Layers className="h-5 w-5 text-accent-600" /><div><p className="text-lg font-bold text-neutral-900">{subjects.reduce((sum, s) => sum + s.children.length, 0)}</p><p className="text-xs text-neutral-500">Chapters</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><User className="h-5 w-5 text-success-600" /><div><p className="text-sm font-bold text-neutral-900">Instructor</p><p className="text-xs text-neutral-500">Coming soon</p></div></div>
        <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">{isFree ? <CheckCircle2 className="h-5 w-5 text-success-600" /> : <IndianRupee className="h-5 w-5 text-warning-600" />}<div><p className="text-sm font-bold text-neutral-900">{isFree ? 'Free' : `₹${displayPrice}`}</p><p className="text-xs text-neutral-500">{pricing?.lifetimeAccess ? 'Lifetime' : pricing?.accessDurationDays ? `${pricing.accessDurationDays} days` : 'One-time'}</p></div></div>
      </div>

      <StudentDashboardSection title="Subjects" description="Explore the curriculum">
        {subjects.length > 0 ? (
          <div className="space-y-3">{subjects.map((subject, i) => (<SubjectCard key={subject.id} subject={subject} enrolled={enrolled} index={i} />))}</div>
        ) : (
          <EmptyDashboard title="No subjects yet" description="Subjects will appear here once they are published." />
        )}
      </StudentDashboardSection>

      {!enrolled && !isFree && pricing && (
        <StudentDashboardSection title="Pricing" description="Unlock this batch to access all content">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">{pricing.salePrice != null && <span className="text-sm text-neutral-400 line-through">₹{pricing.price}</span>}<span className="text-2xl font-bold text-neutral-900">₹{displayPrice}</span></div>
                <p className="mt-1 text-sm text-neutral-500">{pricing.lifetimeAccess ? 'Lifetime access' : pricing.accessDurationDays ? `${pricing.accessDurationDays} days access` : 'One-time purchase'}</p>
              </div>
              <Button variant="primary" size="lg"><Lock className="h-4 w-4" />Unlock Now</Button>
            </div>
          </div>
        </StudentDashboardSection>
      )}
    </div>
  );
}
