import { useState, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { useAdminEnrollments } from '@/hooks/useAdminStudents';
import { enrollmentService } from '@/services/lms/enrollmentService';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { EnrollmentTable } from '@/components/admin/students';
import { ContentFilters } from '@/components/admin/content';
import { ConfirmDialog } from '@/components/admin/common';
import type { Option } from '@/types/common';

export function EnrollmentListPage() {
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [batchId, setBatchId] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'activate' | 'expire' | 'cancel' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { enrollments, batches, loading, error, total, totalPages, page, setPage, refresh } = useAdminEnrollments({ status, batchId: batchId || undefined });

  const batchOptions: Option[] = [{ label: 'All Batches', value: '' }, ...batches.map((b) => ({ label: b.title, value: b.id }))];

  const handleAction = useCallback(async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    if (confirmAction.action === 'activate') await enrollmentService.activateEnrollment(confirmAction.id);
    else if (confirmAction.action === 'expire') await enrollmentService.expireEnrollment(confirmAction.id);
    else if (confirmAction.action === 'cancel') await enrollmentService.cancelEnrollment(confirmAction.id);
    setActionLoading(false);
    setConfirmAction(null);
    refresh();
  }, [confirmAction, refresh]);

  return (
    <div className="space-y-6">
      <PageHeader title="Enrollments" description={`${total} enrollment${total !== 1 ? 's' : ''}`} />
      <ContentFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={setStatus} classOptions={batchOptions} classValue={batchId} onClassChange={setBatchId} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : enrollments.length === 0 ? (
        <EmptyState title="No enrollments found" description="Enrollments will appear here when students are enrolled in batches." icon={<BookOpen className="h-12 w-12" />} />
      ) : (
        <EnrollmentTable enrollments={enrollments} onActivate={(id) => setConfirmAction({ id, action: 'activate' })} onExpire={(id) => setConfirmAction({ id, action: 'expire' })} onCancel={(id) => setConfirmAction({ id, action: 'cancel' })} />
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>
        </div>
      )}
      <ConfirmDialog open={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={handleAction} title={`Confirm ${confirmAction?.action ?? ''}`} message={`Are you sure you want to ${confirmAction?.action ?? ''} this enrollment?`} confirmLabel="Confirm" loading={actionLoading} />
    </div>
  );
}
