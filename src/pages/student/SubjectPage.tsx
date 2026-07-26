import { useParams } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useSubjectDetails } from '@/hooks/useHierarchyDetails';
import { LmsBreadcrumbs } from '@/components/student/lms/LmsBreadcrumbs';
import { ChapterAccordion } from '@/components/student/lms/ChapterAccordion';
import { StudentDashboardSection } from '@/components/student/dashboard/StudentDashboardSection';
import { EmptyDashboard } from '@/components/student/dashboard/EmptyDashboard';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { Badge } from '@/components/ui/Badge';

export function SubjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { parent, batch, subject, breadcrumbs, loading, error, refresh } = useSubjectDetails(slug);

  if (loading) return <DashboardLoadingSkeleton />;
  if (error || !subject) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3">
        <p className="text-sm text-error-700">{error ?? 'Subject not found'}</p>
        <button onClick={refresh} className="mt-2 text-xs text-primary-600 font-medium hover:underline">Retry</button>
      </div>
    );
  }

  const chapters = parent?.children ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <LmsBreadcrumbs items={breadcrumbs} />
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50"><BookOpen className="h-6 w-6 text-primary-600" strokeWidth={2} /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-neutral-900">{subject.title}</h1><Badge variant="primary">{chapters.length} Chapters</Badge></div>
            {subject.description && <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{subject.description}</p>}
            {batch && <p className="mt-2 text-xs text-neutral-400">Part of <span className="font-medium text-neutral-600">{batch.title}</span></p>}
          </div>
        </div>
      </div>
      <StudentDashboardSection title="Chapters" description="Expand to view classes">
        {chapters.length > 0 ? (
          <div className="space-y-3">{chapters.map((chapter, i) => (<ChapterAccordion key={chapter.id} chapter={chapter} enrolled={true} index={i} defaultOpen={i === 0} />))}</div>
        ) : (
          <EmptyDashboard title="No chapters yet" description="Chapters will appear here once they are published." />
        )}
      </StudentDashboardSection>
    </div>
  );
}
