import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { useAdminStudents, useStudentAnalytics } from '@/hooks/useAdminStudents';
import { useDebounce } from '@/hooks/useDebounce';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StudentAnalytics, StudentFilters, StudentTable, StudentCard } from '@/components/admin/students';

export function StudentListPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('all');
  const [batchId, setBatchId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(searchInput, 300);
  const { students, batches, loading, error, total, totalPages, page, setPage } = useAdminStudents({ search: debouncedSearch || undefined, status, batchId: batchId || undefined });
  const { analytics, loading: analyticsLoading } = useStudentAnalytics();

  const toggleSelect = useCallback((id: string) => { setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }, []);
  const toggleSelectAll = useCallback(() => { setSelected((prev) => prev.size === students.length ? new Set() : new Set(students.map((s) => s.id))); }, [students]);

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description={`${total} student${total !== 1 ? 's' : ''}`} actions={<Button onClick={() => navigate('/admin/students/new')}><Users className="h-4 w-4" />New Student</Button>} />
      <StudentAnalytics analytics={analytics} loading={analyticsLoading} />
      <StudentFilters search={searchInput} onSearchChange={setSearchInput} status={status} onStatusChange={setStatus} batches={batches} batchId={batchId} onBatchChange={setBatchId} />
      {error && <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error}</div>}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-lg border border-neutral-200 bg-white animate-pulse" />)}</div>
      ) : students.length === 0 ? (
        <EmptyState title="No students found" description="Students will appear here after they register." icon={<Users className="h-12 w-12" />} />
      ) : (
        <>
          <div className="hidden sm:block"><StudentTable students={students} selected={selected} onToggleSelect={toggleSelect} onToggleSelectAll={toggleSelectAll} /></div>
          <div className="grid grid-cols-1 gap-3 sm:hidden sm:grid-cols-2 lg:grid-cols-3">{students.map((s) => <StudentCard key={s.id} student={s} />)}</div>
        </>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>
        </div>
      )}
    </div>
  );
}
