import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Mail, Phone, Calendar, ShoppingBag, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import type { AdminStudent } from '@/hooks/useAdminStudents';

interface StudentCardProps {
  student: AdminStudent;
}

function StudentCardComponent({ student }: StudentCardProps) {
  return (
    <Link to={`/admin/students/${student.id}`} className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar src={student.avatarUrl ?? undefined} alt={student.fullName ?? 'Student'} fallback={student.fullName ?? 'S'} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">{student.fullName ?? 'Unknown'}</p>
          <div className="mt-1 space-y-1">
            {student.email && <p className="flex items-center gap-1 truncate text-xs text-neutral-500"><Mail className="h-3 w-3" />{student.email}</p>}
            {student.mobile && <p className="flex items-center gap-1 truncate text-xs text-neutral-500"><Phone className="h-3 w-3" />{student.mobile}</p>}
            <p className="flex items-center gap-1 text-xs text-neutral-500"><Calendar className="h-3 w-3" />{format(new Date(student.createdAt), 'MMM d, yyyy')}</p>
          </div>
        </div>
        <Badge variant={student.isActive ? 'success' : 'default'}>{student.isActive ? 'Active' : 'Inactive'}</Badge>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{student.enrollmentCount} courses</span>
        <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" />{student.purchaseCount} purchases</span>
        {student.totalSpent > 0 && <span className="text-success-600 font-medium">₹{student.totalSpent.toLocaleString()}</span>}
      </div>
    </Link>
  );
}

export const StudentCard = memo(StudentCardComponent);
