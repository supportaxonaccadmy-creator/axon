import { useMemo } from 'react';
import { File as FileIcon, Image as ImageIcon, FileText, Film, FileCheck, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useStorageAnalytics } from '@/hooks/useStorageAnalytics';
import { formatFileSize } from '@/services/storage';

export function StorageStatsCards() {
  const { analytics, loading, error } = useStorageAnalytics();

  const stats = useMemo(() => {
    if (!analytics) return null;
    return [
      { label: 'Total Files', value: String(analytics.totalFiles), icon: FileIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
      { label: 'Storage Used', value: formatFileSize(analytics.totalSize), icon: HardDrive, color: 'text-purple-500', bg: 'bg-purple-50' },
      { label: 'Images', value: String(analytics.imagesCount), icon: ImageIcon, color: 'text-green-500', bg: 'bg-green-50' },
      { label: 'PDFs', value: String(analytics.pdfsCount), icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
      { label: 'Videos', value: String(analytics.videosCount), icon: Film, color: 'text-orange-500', bg: 'bg-orange-50' },
      { label: 'Documents', value: String(analytics.documentsCount), icon: FileCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];
  }, [analytics]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-28 animate-pulse bg-neutral-100">&nbsp;</Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <p className="text-sm text-error-600">Failed to load storage analytics: {error}</p>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} hover>
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
