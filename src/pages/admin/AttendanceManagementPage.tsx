import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AttendanceTable } from '@/components/live';
import { attendanceService } from '@/services/live';
import { useCurrentUser } from '@/hooks/useProfile';
import type { LiveAttendance, AttendanceStatus } from '@/services/live';

export function AttendanceManagementPage() {
  const { liveClassId } = useParams();
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [attendance, setAttendance] = useState<LiveAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!liveClassId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await attendanceService.getByClass(liveClassId);
      setAttendance(data);
      setLoading(false);
    };
    void fetch();
  }, [liveClassId]);

  const handleExport = async () => {
    if (!liveClassId) return;
    const { data } = await attendanceService.exportCsv(liveClassId);
    if (data) {
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `attendance_${liveClassId}.csv`; a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleUpdateStatus = async (attendanceId: string, status: AttendanceStatus) => {
    const { error } = await attendanceService.updateStatus(attendanceId, status, adminId);
    if (!error && liveClassId) {
      const { data } = await attendanceService.getByClass(liveClassId);
      setAttendance(data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Attendance Management</h1>
        <p className="mt-1 text-sm text-neutral-500">View and manage student attendance</p>
      </div>
      <AttendanceTable
        attendance={attendance}
        loading={loading}
        onExport={handleExport}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}