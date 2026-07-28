import { useState } from 'react';
import { HardDrive, Trash2, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StorageStatsCards } from '@/components/admin/storage/StorageStatsCards';
import { FileManager } from '@/components/admin/storage/FileManager';
import { useStorageCleanup } from '@/hooks/useStorageCleanup';
import { useStorageAnalytics } from '@/hooks/useStorageAnalytics';
import { formatFileSize } from '@/services/storage';
import { useNavigate } from 'react-router-dom';

export function StorageDashboardPage() {
  const navigate = useNavigate();
  const { runCleanup, loading: cleanupLoading, cleanupResult, error: cleanupError } = useStorageCleanup();
  const { analytics, refetch } = useStorageAnalytics();
  const [showCleanup, setShowCleanup] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Storage Management</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage uploaded files, track usage, and maintain storage hygiene</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCleanup(true)}>
            <Trash2 className="h-4 w-4" /> Cleanup
          </Button>
          <Button size="sm" onClick={() => navigate('/admin/storage/upload')}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
      </div>

      <StorageStatsCards />

      {analytics && analytics.monthlyUploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Upload Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.monthlyUploads.map((m) => {
                const maxCount = Math.max(...analytics.monthlyUploads.map((x) => x.count), 1);
                const widthPct = (m.count / maxCount) * 100;
                return (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-neutral-500">{m.month}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-neutral-100">
                      <div
                        className="h-full rounded bg-primary-500 transition-all"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-medium text-neutral-700">{m.count}</span>
                    <span className="w-16 text-right text-xs text-neutral-400">{formatFileSize(m.size)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">All Files</h2>
        <FileManager />
      </div>

      {showCleanup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="max-w-md p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error-50">
                <HardDrive className="h-5 w-5 text-error-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Cleanup Unused Files</h3>
                <p className="text-sm text-neutral-500">Remove orphaned and replaced files from storage</p>
              </div>
            </div>

            {cleanupError && (
              <p className="mt-3 text-sm text-error-600">{cleanupError}</p>
            )}

            {cleanupResult && !cleanupResult.error && (
              <div className="mt-3 rounded-lg border border-success-200 bg-success-50 p-3">
                <p className="text-sm text-success-700">
                  Deleted {cleanupResult.deletedCount} files and freed {formatFileSize(cleanupResult.freedBytes)}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowCleanup(false); void refetch(); }}>
                Close
              </Button>
              <Button
                variant="danger"
                loading={cleanupLoading}
                onClick={() => void runCleanup()}
                disabled={cleanupLoading}
              >
                Run Cleanup
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
