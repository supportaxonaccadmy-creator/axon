import { useParams } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { useChapterDetails } from '@/hooks/useHierarchyDetails';
import { LmsBreadcrumbs } from '@/components/student/lms/LmsBreadcrumbs';
import { ClassCard } from '@/components/student/lms/ClassCard';
import { StudentDashboardSection } from '@/components/student/dashboard/StudentDashboardSection';
import { EmptyDashboard } from '@/components/student/dashboard/EmptyDashboard';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { Badge } from '@/components/ui/Badge';

export function ChapterPage() {
  const { slug } = useParams<{ slug: string }>();
  const { parent, batch, subject, chapter, breadcrumbs, loading, error, refresh } = useChapterDetails(slug);

  if (loading) return <DashboardLoadingSkeleton />;
  if (error || !chapter) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3">
        <p className="text-sm text-error-700">{error ?? 'Chapter not found'}</p>
        <button onClick={refresh} className="mt-2 text-xs text-primary-600 font-medium hover:underline">Retry</button>
      </div>
    );
  }

  const classes = parent?.children ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <LmsBreadcrumbs items={breadcrumbs} />
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50"><FolderOpen className="h-6 w-6 text-primary-600" strokeWidth={2} /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-neutral-900">{chapter.title}</h1><Badge variant="primary">{classes.length} Classes</Badge></div>
            {chapter.description && <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{chapter.description}</p>}
            {subject && batch && <p className="mt-2 text-xs text-neutral-400"><span className="font-medium text-neutral-600">{subject.title}</span> in <span className="font-medium text-neutral-600">{batch.title}</span></p>}
          </div>
        </div>
      </div>
      <StudentDashboardSection title="Classes" description="Watch, read, and practice">
        {classes.length > 0 ? (
          <div className="space-y-3">{classes.map((cls, i) => (<ClassCard key={cls.id} cls={cls} chapterSlug={chapter.slug} enrolled={true} index={i} />))}</div>
        ) : (
          <EmptyDashboard title="No classes yet" description="Classes will appear here once they are published." />
        )}
      </StudentDashboardSection>
    </div>
  );
}
