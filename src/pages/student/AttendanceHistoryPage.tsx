import { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AttendanceBadge } from '@/components/live';
import { attendanceService } from '@/services/live';
import { useCurrentUser } from '@/hooks/useProfile';
import { formatDateTime, formatDuration } from '@/services/live';
import type { LiveAttendance } from '@/services/live';

interface AttendanceWithClass extends LiveAttendance {
  live_classes?: { id: string; title: string; start_time: string; end_time: string } | null;
}

export function AttendanceHistoryPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const [attendance, setAttendance] = useState<LiveAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await attendanceService.getByStudent(studentId);
      setAttendance(data);
      setLoading(false);
    };
    void fetch();
  }, [studentId]);

  const stats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, rate };
  }, [attendance]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Attendance History</h1>
        <p className="mt-1 text-sm text-neutral-500">Your attendance record for all live classes</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card hover><CardContent className="flex flex-col items-center gap-1 p-4 text-center"><CheckCircle className="h-5 w-5 text-green-500" /><p className="text-xl font-bold text-neutral-900">{stats.present}</p><p className="text-xs text-neutral-500">Present</p></CardContent></Card>
        <Card hover><CardContent className="flex flex-col items-center gap-1 p-4 text-center"><AlertCircle className="h-5 w-5 text-orange-500" /><p className="text-xl font-bold text-neutral-900">{stats.late}</p><p className="text-xs text-neutral-500">Late</p></CardContent></Card>
        <Card hover><CardContent className="flex flex-col items-center gap-1 p-4 text-center"><XCircle className="h-5 w-5 text-red-500" /><p className="text-xl font-bold text-neutral-900">{stats.absent}</p><p className="text-xs text-neutral-500">Absent</p></CardContent></Card>
        <Card hover><CardContent className="flex flex-col items-center gap-1 p-4 text-center"><Clock className="h-5 w-5 text-blue-500" /><p className="text-xl font-bold text-neutral-900">{stats.rate}%</p><p className="text-xs text-neutral-500">Attendance Rate</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Attendance Records</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="py-8 text-center text-sm text-neutral-500">Loading...</div> : attendance.length === 0 ? <div className="py-8 text-center text-sm text-neutral-500">No attendance records yet</div> : (
            <div className="space-y-2">
              {attendance.map((record) => {
                const r = record as AttendanceWithClass;
                const liveClass = r.live_classes;
                return (
                  <div key={record.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">{liveClass?.title ?? 'Unknown class'}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        {liveClass && <span>{formatDateTime(liveClass.start_time)}</span>}
                        {record.durationSeconds && record.durationSeconds > 0 && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDuration(record.durationSeconds)}</span>}
                        {record.manualOverride && <span>(manually set)</span>}
                      </div>
                    </div>
                    <AttendanceBadge status={record.status} />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}