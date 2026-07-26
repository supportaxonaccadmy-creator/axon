import { useParams, Link } from 'react-router-dom';
import { PlayCircle, FileText, HelpCircle, Clock, ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { hierarchyService } from '@/services/lms/hierarchyService';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/services/lms/hierarchyService';
import { LmsBreadcrumbs } from '@/components/student/lms/LmsBreadcrumbs';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function ClassPage() {
  const { slug } = useParams<{ slug: string }>();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setError('No class specified'); setLoading(false); return; }
    setLoading(true);
    hierarchyService.buildBreadcrumb('class', slug).then((result) => {
      if (result.error) { setError(result.error); setBreadcrumbs([]); }
      else { setBreadcrumbs(result.data ?? []); setError(null); }
      setLoading(false);
    }).catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Failed to load class'); setLoading(false); });
  }, [slug]);

  if (loading) return <DashboardLoadingSkeleton />;
  if (error || breadcrumbs.length === 0) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3">
        <p className="text-sm text-error-700">{error ?? 'Class not found'}</p>
        <Link to="/student/batches" className="mt-2 inline-block text-xs text-primary-600 font-medium hover:underline">Back to Batches</Link>
      </div>
    );
  }

  const classItem = breadcrumbs[breadcrumbs.length - 1]!;
  const chapterItem = breadcrumbs.find((b) => b.type === 'chapter');
  const subjectItem = breadcrumbs.find((b) => b.type === 'subject');
  const batchItem = breadcrumbs.find((b) => b.type === 'batch');

  return (
    <div className="space-y-6 animate-fade-in">
      <LmsBreadcrumbs items={breadcrumbs} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900 shadow-sm">
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center"><PlayCircle className="mx-auto h-16 w-16 text-white/20" strokeWidth={1.5} /><p className="mt-2 text-sm text-white/40">Class content will appear here</p></div>
            </div>
          </div>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50"><PlayCircle className="h-6 w-6 text-primary-600" strokeWidth={2} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><h1 className="text-xl font-bold text-neutral-900">{classItem.title}</h1><Badge variant="primary">Class</Badge></div>
                {subjectItem && batchItem && <p className="mt-1 text-xs text-neutral-400"><Link to={`/student/subjects/${subjectItem.slug}`} className="hover:text-primary-600 transition-colors">{subjectItem.title}</Link><ChevronRight className="inline h-3 w-3 mx-1" /><Link to={`/student/chapters/${chapterItem?.slug ?? ''}`} className="hover:text-primary-600 transition-colors">{chapterItem?.title ?? ''}</Link></p>}</div>
            </div>
          </Card>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex flex-col items-center gap-3 p-5 text-center hover:shadow-md transition-shadow cursor-pointer"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50"><PlayCircle className="h-6 w-6 text-primary-600" /></div><div><p className="text-sm font-semibold text-neutral-800">Video Lesson</p><p className="text-xs text-neutral-500">Watch the class</p></div></Card>
            <Card className="flex flex-col items-center gap-3 p-5 text-center hover:shadow-md transition-shadow cursor-pointer"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50"><FileText className="h-6 w-6 text-accent-600" /></div><div><p className="text-sm font-semibold text-neutral-800">PDF Notes</p><p className="text-xs text-neutral-500">Download notes</p></div></Card>
            <Card className="flex flex-col items-center gap-3 p-5 text-center hover:shadow-md transition-shadow cursor-pointer"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-50"><HelpCircle className="h-6 w-6 text-success-600" /></div><div><p className="text-sm font-semibold text-neutral-800">MCQ Practice</p><p className="text-xs text-neutral-500">Test yourself</p></div></Card>
          </div>
        </div>
        <div className="space-y-4">
          <Card className="p-5"><h3 className="text-sm font-semibold text-neutral-800">Class Details</h3><div className="mt-3 space-y-2 text-sm"><div className="flex items-center gap-2 text-neutral-500"><Clock className="h-4 w-4" />Duration: Not specified</div><div className="flex items-center gap-2 text-neutral-500"><BookOpen className="h-4 w-4" />Type: Video Class</div></div></Card>
          {chapterItem && <Card className="p-5"><h3 className="text-sm font-semibold text-neutral-800">Navigate</h3><div className="mt-3 space-y-2"><Link to={`/student/chapters/${chapterItem.slug}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><ArrowLeft className="h-3.5 w-3.5" />Back to {chapterItem.title}</Link>{batchItem && <Link to={`/student/batches/${batchItem.slug}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><BookOpen className="h-3.5 w-3.5" />View {batchItem.title}</Link>}</div></Card>}
        </div>
      </div>
    </div>
  );
}
