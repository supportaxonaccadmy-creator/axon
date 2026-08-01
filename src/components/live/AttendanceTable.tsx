import { memo } from 'react';
import { Download } from 'lucide-react';
import { AttendanceBadge } from './AttendanceBadge';
import { formatDateTime, formatDuration } from '@/services/live';
import type { LiveAttendance } from '@/services/live';

interface AttendanceTableProps {
  attendance: LiveAttendance[];
  loading?: boolean | undefined;
  onExport?: (() => void) | undefined;
  onOverrideStatus?: ((studentId: string, status: import('@/services/live').AttendanceStatus) => void) | undefined;
}

interface AttendanceRowWithProfile extends LiveAttendance {
  profile?: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
}

function AttendanceTableComponent({ attendance, loading, onExport, onOverrideStatus }: AttendanceTableProps) {
  if (loading) {
    return <div className="py-8 text-center text-sm text-neutral-500">Loading attendance...</div>;
  }

  if (attendance.length === 0) {
    return <div className="py-8 text-center text-sm text-neutral-500">No attendance records</div>;
  }

  return (
    <div className="overflow-x-auto">
      {onExport && (
        <div className="mb-3 flex justify-end">
          <button
            onClick={onExport}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
            <th className="pb-2 pr-4 font-medium">Student</th>
            <th className="pb-2 pr-4 font-medium">Join Time</th>
            <th className="pb-2 pr-4 font-medium">Leave Time</th>
            <th className="pb-2 pr-4 font-medium">Duration</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            {onOverrideStatus && <th className="pb-2 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {attendance.map((record) => {
            const r = record as AttendanceRowWithProfile;
            return (
              <tr key={record.id} className="border-b border-neutral-50">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {r.profile?.avatar_url && (
                      <img src={r.profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="font-medium text-neutral-900">{r.profile?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-neutral-400">{r.profile?.email ?? ''}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4 text-neutral-600">
                  {record.joinTime ? formatDateTime(record.joinTime) : '—'}
                </td>
                <td className="py-3 pr-4 text-neutral-600">
                  {record.leaveTime ? formatDateTime(record.leaveTime) : '—'}
                </td>
                <td className="py-3 pr-4 text-neutral-600">
                  {record.durationSeconds > 0 ? formatDuration(record.durationSeconds) : '—'}
                </td>
                <td className="py-3 pr-4">
                  <AttendanceBadge status={record.status} />
                  {record.manualOverride && (
                    <span className="ml-1 text-[10px] text-neutral-400">(overridden)</span>
                  )}
                </td>
                {onOverrideStatus && (
                  <td className="py-3">
                    <select
                      value={record.status}
                      onChange={(e) => onOverrideStatus(record.studentId, e.target.value as import('@/services/live').AttendanceStatus)}
                      className="rounded-md border border-neutral-200 px-2 py-1 text-xs"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const AttendanceTable = memo(AttendanceTableComponent);
