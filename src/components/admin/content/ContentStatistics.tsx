import { memo } from 'react';
import { Layers, Video, FileText, Paperclip } from 'lucide-react';

interface ContentStatisticsProps {
  totalClasses: number;
  totalVideos: number;
  totalPdfs: number;
  totalAttachments: number;
  loading?: boolean;
}

function ContentStatisticsComponent({ totalClasses, totalVideos, totalPdfs, totalAttachments, loading = false }: ContentStatisticsProps) {
  if (loading) return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl border border-neutral-200 bg-white animate-pulse" />)}</div>;
  const items = [
    { label: 'Classes', value: totalClasses, icon: Layers, color: 'text-primary-600 bg-primary-50' },
    { label: 'Videos', value: totalVideos, icon: Video, color: 'text-accent-600 bg-accent-50' },
    { label: 'PDF Notes', value: totalPdfs, icon: FileText, color: 'text-success-600 bg-success-50' },
    { label: 'Attachments', value: totalAttachments, icon: Paperclip, color: 'text-warning-600 bg-warning-50' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => { const Icon = item.icon; return (
        <div key={item.label} className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color}`}><Icon className="h-4 w-4" /></div>
          <div><p className="text-xl font-bold text-neutral-900">{item.value}</p><p className="text-xs text-neutral-500">{item.label}</p></div>
        </div>
      ); })}
    </div>
  );
}

export const ContentStatistics = memo(ContentStatisticsComponent);
