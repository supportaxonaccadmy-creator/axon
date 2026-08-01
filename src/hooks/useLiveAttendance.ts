import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '@/services/live';
import type { LiveAttendance, AttendanceStatus } from '@/services/live';

export function useLiveAttendance(liveClassId: string | null) {
  const [attendance, setAttendance] = useState<LiveAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    if (!liveClassId) { setLoading(false); return; }
    setLoading(true);
    const { data, error: err } = await attendanceService.getByClass(liveClassId);
    if (err) setError(err);
    else { setAttendance(data); setError(null); }
    setLoading(false);
  }, [liveClassId]);

  useEffect(() => { void fetchAttendance(); }, [fetchAttendance]);

  const recordJoin = useCallback(async (studentId: string) => {
    if (!liveClassId) return;
    const { error: err } = await attendanceService.recordJoin(liveClassId, studentId);
    if (!err) void fetchAttendance();
    return { error: err };
  }, [liveClassId, fetchAttendance]);

  const recordLeave = useCallback(async (studentId: string) => {
    if (!liveClassId) return;
    const { error: err } = await attendanceService.recordLeave(liveClassId, studentId);
    if (!err) void fetchAttendance();
    return { error: err };
  }, [liveClassId, fetchAttendance]);

  const updateStatus = useCallback(async (studentId: string, status: AttendanceStatus, overriddenBy: string) => {
    if (!liveClassId) return;
    const { error: err } = await attendanceService.updateStatus(liveClassId, studentId, status, overriddenBy);
    if (!err) void fetchAttendance();
    return { error: err };
  }, [liveClassId, fetchAttendance]);

  const exportCsv = useCallback(async () => {
    if (!liveClassId) return { data: '', error: 'No class selected' };
    return attendanceService.exportCsv(liveClassId);
  }, [liveClassId]);

  return {
    attendance, loading, error,
    recordJoin, recordLeave, updateStatus, exportCsv,
    refetch: fetchAttendance,
  };
}
