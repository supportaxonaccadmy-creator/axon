import { memo, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Search } from 'lucide-react';
import type { LiveAttendance, AttendanceStatus } from '@/services/live';
import { ATTENDANCE_LABELS, formatDuration } from '@/services/live';
import { AttendanceBadge } from './AttendanceBadge';

interface AttendanceTableProps {
  attendance: LiveAttendance[];
  loading?: boolean;
  onExport?: () => void;
  onUpdateStatus?: (attendanceId: string, status: AttendanceStatus) => void;
  className?: string | undefined;
}

const STATUS_OPTIONS: AttendanceStatus[] = ['present', 'absent', 'late'];

function AttendanceTableComponent({ attendance, loading, onExport, onUpdateStatus, className }: AttendanceTableProps) {
  const [search, setSearch] = useState('');

  const filtered = attendance.filter((a) => a.studentId.toLowerCase().includes(search.toLowerCase()));

  const handleExport = useCallback(() => {
    if (onExport) onExport();
  }, [onExport]);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attendance ({attendance.length})</CardTitle>
        {onExport && (
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-neutral-500">Loading attendance...</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-neutral-500">No attendance records</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
                  <th className="pb-2 pr-4 font-medium">Student ID</th>
                  <th className="pb-2 pr-4 font-medium">Join Time</th>
                  <th className="pb-2 pr-4 font-medium">Leave Time</th>
                  <th className="pb-2 pr-4 font-medium">Duration</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  {onUpdateStatus && <th className="pb-2 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-neutral-100">
                    <td className="py-3 pr-4 font-mono text-xs text-neutral-700">{a.studentId}</td>
                    <td className="py-3 pr-4 text-neutral-600">{a.joinTime ? new Date(a.joinTime).toLocaleString() : '—'}</td>
                    <td className="py-3 pr-4 text-neutral-600">{a.leaveTime ? new Date(a.leaveTime).toLocaleString() : '—'}</td>
                    <td className="py-3 pr-4 text-neutral-600">{a.durationSeconds ? formatDuration(a.durationSeconds) : '—'}</td>
                    <td className="py-3 pr-4">
                      <AttendanceBadge status={a.status} />
                    </td>
                    {onUpdateStatus && (
                      <td className="py-3">
                        <select
                          value={a.status}
                          onChange={(e) => onUpdateStatus(a.id, e.target.value as AttendanceStatus)}
                          className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-primary-500 focus:outline-none"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{ATTENDANCE_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const AttendanceTable = memo(AttendanceTableComponent);