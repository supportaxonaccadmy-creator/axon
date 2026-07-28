import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import type { AdminStudent } from '@/hooks/useAdminStudents';

interface StudentTableProps {
  students: AdminStudent[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

function StudentTableComponent({ students, selected, onToggleSelect, onToggleSelectAll }: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="hidden border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex sm:items-center sm:gap-4">
        <input type="checkbox" checked={selected.size === students.length && students.length > 0} onChange={onToggleSelectAll} className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
        <span className="flex-1 text-xs font-medium text-neutral-500">Student</span>
        <span className="hidden w-32 text-xs font-medium text-neutral-500 lg:block">Mobile</span>
        <span className="hidden w-16 text-xs font-medium text-neutral-500 lg:block">Courses</span>
        <span className="hidden w-16 text-xs font-medium text-neutral-500 lg:block">Purchases</span>
        <span className="hidden w-20 text-xs font-medium text-neutral-500 lg:block">Spent</span>
        <span className="hidden w-28 text-xs font-medium text-neutral-500 sm:block">Joined</span>
        <span className="w-20 text-xs font-medium text-neutral-500">Status</span>
      </div>
      <div className="divide-y divide-neutral-100">
        {students.map((s) => (
          <div key={s.id} className={cn('flex items-center gap-4 px-4 py-3 transition-colors hover:bg-neutral-50', selected.has(s.id) && 'bg-primary-50/50')}>
            <input type="checkbox" checked={selected.has(s.id)} onChange={() => onToggleSelect(s.id)} className="h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
            <Link to={`/admin/students/${s.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar src={s.avatarUrl ?? undefined} alt={s.fullName ?? 'Student'} fallback={s.fullName ?? 'S'} size="sm" />
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-neutral-900">{s.fullName ?? 'Unknown'}</p><p className="truncate text-xs text-neutral-500">{s.email ?? 'No email'}</p></div>
            </Link>
            <div className="hidden w-32 shrink-0 lg:block"><span className="truncate text-xs text-neutral-600">{s.mobile ?? '—'}</span></div>
            <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{s.enrollmentCount}</div>
            <div className="hidden w-16 shrink-0 text-sm text-neutral-600 lg:block">{s.purchaseCount}</div>
            <div className="hidden w-20 shrink-0 text-sm font-medium text-neutral-900 lg:block">{s.totalSpent > 0 ? `₹${s.totalSpent.toLocaleString()}` : '—'}</div>
            <div className="hidden w-28 shrink-0 text-xs text-neutral-600 sm:block">{format(new Date(s.createdAt), 'MMM d, yyyy')}</div>
            <div className="w-20 shrink-0"><Badge variant={s.isActive ? 'success' : 'default'}>{s.isActive ? 'Active' : 'Inactive'}</Badge></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const StudentTable = memo(StudentTableComponent);
