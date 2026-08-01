import { useState, useCallback } from 'react';
import { attendanceService } from '@/services/live';
import type { LiveAttendance, AttendanceStatus } from '@/services/live';

export function useLiveAttendance(liveClassId?: string) {
  const [attendance, setAttendance] = useState<LiveAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async (classId?: string) => {
    const targetId = classId ?? liveClassId;
    if (!targetId) return;
    setLoading(true);
    const { data, error: err } = await attendanceService.getByClass(targetId);
    if (err) setError(err);
    else { setAttendance(data); setError(null); }
    setLoading(false);
  }, [liveClassId]);

  const recordJoin = useCallback(async (classId: string, studentId: string) => {
    const { data, error: err } = await attendanceService.recordJoin(classId, studentId);
    if (!err && data) setAttendance((prev) => [data, ...prev]);
    return { data, error: err };
  }, []);

  const recordLeave = useCallback(async (attendanceId: string) => {
    const { data, error: err } = await attendanceService.recordLeave(attendanceId);
    if (!err && data) setAttendance((prev) => prev.map((a) => (a.id === attendanceId ? data : a)));
    return { data, error: err };
  }, []);

  const updateStatus = useCallback(async (attendanceId: string, status: AttendanceStatus, overriddenBy?: string | null) => {
    const { data, error: err } = await attendanceService.updateStatus(attendanceId, status, overriddenBy);
    if (!err && data) setAttendance((prev) => prev.map((a) => (a.id === attendanceId ? data : a)));
    return { data, error: err };
  }, []);

  const exportCsv = useCallback(async (classId: string) => {
    return attendanceService.exportCsv(classId);
  }, []);

  return {
    attendance, loading, error,
    fetchAttendance, recordJoin, recordLeave, updateStatus, exportCsv,
  };
}