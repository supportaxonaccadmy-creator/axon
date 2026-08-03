import { useState, useEffect, useCallback } from 'react';
import { Video, FileText, HelpCircle, Eye } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { AnalyticsCard } from '@/components/analytics';
import { videoAnalyticsService, mcqAnalyticsService } from '@/services/analytics';

export function ContentAnalyticsPage() {
  const [videoData, setVideoData] = useState<{ totalVideos: number; totalViews: number; averageCompletionRate: number } | null>(null);
  const [mcqData, setMcqData] = useState<{ totalSets: number; totalQuestions: number } | null>(null);
  const [pdfCount, setPdfCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    const [videoResult, mcqResult] = await Promise.all([videoAnalyticsService.getOverview(), mcqAnalyticsService.getOverview()]);
    if (videoResult.data) setVideoData({ totalVideos: videoResult.data.totalVideos, totalViews: videoResult.data.totalViews, averageCompletionRate: videoResult.data.averageCompletionRate });
    if (mcqResult.data) setMcqData({ totalSets: mcqResult.data.totalSets, totalQuestions: mcqResult.data.totalQuestions });
    const { getSupabaseClient } = await import('@/lib/supabase');
    const supabase = getSupabaseClient();
    const { count } = await supabase.from('pdf_notes').select('*', { count: 'exact', head: true });
    setPdfCount(count ?? 0);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <PageContainer><div className="flex h-64 items-center justify-center text-neutral-400">Loading content analytics...</div></PageContainer>;
  return (
    <PageContainer>
      <SectionHeader title="Content Analytics" description="Video, PDF, and MCQ performance insights" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard title="Total Videos" value={videoData?.totalVideos ?? 0} icon={Video} color="primary" />
        <AnalyticsCard title="Total Views" value={videoData?.totalViews ?? 0} icon={Eye} color="accent" />
        <AnalyticsCard title="Completion Rate" value={`${(videoData?.averageCompletionRate ?? 0).toFixed(1)}%`} icon={Video} color="success" />
        <AnalyticsCard title="Total PDFs" value={pdfCount} icon={FileText} color="warning" />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AnalyticsCard title="MCQ Sets" value={mcqData?.totalSets ?? 0} icon={HelpCircle} color="primary" />
        <AnalyticsCard title="MCQ Questions" value={mcqData?.totalQuestions ?? 0} icon={HelpCircle} color="accent" />
      </div>
      {videoData && videoData.totalViews > 0 && <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-3 text-sm font-semibold text-neutral-900">Video Performance</h3><p className="text-sm text-neutral-600">Average completion rate: {(videoData.averageCompletionRate).toFixed(1)}%</p></div>}
    </PageContainer>
  );
}
