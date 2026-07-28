import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PlayCircle, FileText, HelpCircle, Clock, BookOpen, ChevronRight } from 'lucide-react';
import { hierarchyService } from '@/services/lms/hierarchyService';
import { videoStreamingService } from '@/services/video';
import { useCurrentUser } from '@/hooks/useProfile';
import type { BreadcrumbItem } from '@/services/lms/hierarchyService';
import type { VideoWithFile } from '@/services/video';
import { LmsBreadcrumbs } from '@/components/student/lms/LmsBreadcrumbs';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { VideoPlayer } from '@/components/video';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function VideoWatchPage() {
  const { slug } = useParams<{ slug: string }>();
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [videos, setVideos] = useState<VideoWithFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoWithFile | null>(null);

  useEffect(() => {
    if (!slug) { setError('No class specified'); setLoading(false); return; }
    setLoading(true);
    void (async () => {
      const breadcrumbResult = await hierarchyService.buildBreadcrumb('class', slug);
      if (breadcrumbResult.error) { setError(breadcrumbResult.error); setLoading(false); return; }
      setBreadcrumbs(breadcrumbResult.data ?? []);

      const classItem = breadcrumbResult.data?.[breadcrumbResult.data.length - 1];
      if (!classItem) { setError('Class not found'); setLoading(false); return; }

      const videoResult = await videoStreamingService.getVideosByClass(classItem.id);
      if (videoResult.error) { setError(videoResult.error); setLoading(false); return; }
      setVideos(videoResult.data);
      setActiveVideo(videoResult.data[0] ?? null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <DashboardLoadingSkeleton />;
  if (error || breadcrumbs.length === 0) {
    return (
      <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3">
        <p className="text-sm text-error-700">{error ?? 'Class not found'}</p>
        <Link to="/student/batches" className="mt-2 inline-block text-xs font-medium text-primary-600 hover:underline">Back to Batches</Link>
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
        <div className="space-y-6 lg:col-span-2">
          {activeVideo ? (
            <VideoPlayer
              videoUrl={activeVideo.videoUrl ?? activeVideo.youtubeUrl}
              videoId={activeVideo.id}
              studentId={studentId}
              videoDuration={activeVideo.durationSeconds ?? activeVideo.duration ?? 0}
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-neutral-200 bg-neutral-900">
              <div className="text-center">
                <PlayCircle className="mx-auto h-16 w-16 text-white/20" strokeWidth={1.5} />
                <p className="mt-2 text-sm text-white/40">No video available for this class</p>
              </div>
            </div>
          )}

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                <PlayCircle className="h-6 w-6 text-primary-600" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-neutral-900">{classItem.title}</h1>
                  <Badge variant="primary">Class</Badge>
                </div>
                {subjectItem && batchItem && (
                  <p className="mt-1 text-xs text-neutral-400">
                    <Link to={`/student/subjects/${subjectItem.slug}`} className="transition-colors hover:text-primary-600">{subjectItem.title}</Link>
                    <ChevronRight className="mx-1 inline h-3 w-3" />
                    <Link to={`/student/chapters/${chapterItem?.slug ?? ''}`} className="transition-colors hover:text-primary-600">{chapterItem?.title ?? ''}</Link>
                  </p>
                )}
              </div>
            </div>
          </Card>

          {videos.length > 1 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-800">All Videos in This Class</h3>
              <div className="space-y-2">
                {videos.map((video, idx) => (
                  <button
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      activeVideo?.id === video.id ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xs font-medium text-neutral-400">{idx + 1}</span>
                    <PlayCircle className="h-5 w-5 text-primary-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{video.title}</p>
                      {video.durationSeconds && <p className="text-xs text-neutral-500">{Math.floor(video.durationSeconds / 60)}:{String(video.durationSeconds % 60).padStart(2, '0')}</p>}
                    </div>
                    {video.isPreview && <Badge variant="primary" className="text-[10px]">Preview</Badge>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex flex-col items-center gap-3 p-5 text-center transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50"><PlayCircle className="h-6 w-6 text-primary-600" /></div>
              <div><p className="text-sm font-semibold text-neutral-800">Video Lesson</p><p className="text-xs text-neutral-500">Watch the class</p></div>
            </Card>
            <Card className="flex flex-col items-center gap-3 p-5 text-center transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50"><FileText className="h-6 w-6 text-accent-600" /></div>
              <div><p className="text-sm font-semibold text-neutral-800">PDF Notes</p><p className="text-xs text-neutral-500">Download notes</p></div>
            </Card>
            <Card className="flex flex-col items-center gap-3 p-5 text-center transition-shadow hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-50"><HelpCircle className="h-6 w-6 text-success-600" /></div>
              <div><p className="text-sm font-semibold text-neutral-800">MCQ Practice</p><p className="text-xs text-neutral-500">Test yourself</p></div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-neutral-800">Class Details</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-neutral-500"><Clock className="h-4 w-4" />Duration: {activeVideo?.durationSeconds ? `${Math.floor(activeVideo.durationSeconds / 60)}:${String(activeVideo.durationSeconds % 60).padStart(2, '0')}` : 'Not specified'}</div>
              <div className="flex items-center gap-2 text-neutral-500"><BookOpen className="h-4 w-4" />Type: Video Class</div>
              {activeVideo?.videoQuality && <div className="flex items-center gap-2 text-neutral-500"><PlayCircle className="h-4 w-4" />Quality: {activeVideo.videoQuality}</div>}
            </div>
          </Card>

          {chapterItem && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-neutral-800">Navigate</h3>
              <div className="mt-3 space-y-2">
                <Link to={`/student/chapters/${chapterItem.slug}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" />Back to {chapterItem.title}
                </Link>
                {batchItem && (
                  <Link to={`/student/batches/${batchItem.slug}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline">
                    <BookOpen className="h-3.5 w-3.5" />View {batchItem.title}
                  </Link>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
