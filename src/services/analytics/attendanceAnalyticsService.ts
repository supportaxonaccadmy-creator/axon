import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface AttendanceAnalyticsData {
  totalLiveClasses: number; totalAttendanceRecords: number; averageAttendanceRate: number;
  presentCount: number; absentCount: number; lateCount: number;
  attendanceByStatus: Array<{ status: string; count: number; percentage: number }>;
  attendanceTrend: Array<{ date: string; present: number; absent: number; late: number }>;
}

export const attendanceAnalyticsService = {
  async getOverview(): Promise<{ data: AttendanceAnalyticsData | null; error: string | null }> {
    const supabase = getSupabaseClient();
    try {
      const [{ data: liveClasses }, { data: attendance }] = await Promise.all([
        supabase.from('live_classes').select('id, start_time, status'),
        supabase.from('live_attendance').select('id, live_class_id, student_id, status, created_at'),
      ]);
      const attendanceRows = attendance ?? [];
      const presentCount = attendanceRows.filter((a) => a.status === 'present').length;
      const absentCount = attendanceRows.filter((a) => a.status === 'absent').length;
      const lateCount = attendanceRows.filter((a) => a.status === 'late').length;
      const total = attendanceRows.length;
      const averageAttendanceRate = total > 0 ? ((presentCount + lateCount) / total) * 100 : 0;
      const statusCounts = [{ status: 'Present', count: presentCount, percentage: total > 0 ? (presentCount / total) * 100 : 0 }, { status: 'Absent', count: absentCount, percentage: total > 0 ? (absentCount / total) * 100 : 0 }, { status: 'Late', count: lateCount, percentage: total > 0 ? (lateCount / total) * 100 : 0 }];
      const trendMap = new Map<string, { present: number; absent: number; late: number }>();
      for (const a of attendanceRows) { const date = (a.created_at as string).split('T')[0] ?? ''; if (!trendMap.has(date)) trendMap.set(date, { present: 0, absent: 0, late: 0 }); const entry = trendMap.get(date)!; if (a.status === 'present') entry.present++; else if (a.status === 'absent') entry.absent++; else if (a.status === 'late') entry.late++; }
      return { data: { totalLiveClasses: liveClasses?.length ?? 0, totalAttendanceRecords: total, averageAttendanceRate, presentCount, absentCount, lateCount, attendanceByStatus: statusCounts, attendanceTrend: Array.from(trendMap.entries()).map(([date, counts]) => ({ date, ...counts })).sort((a, b) => a.date.localeCompare(b.date)) }, error: null };
    } catch (err) { logger.error('attendanceAnalyticsService.getOverview', { error: err instanceof Error ? err.message : 'Unknown' }); return { data: null, error: err instanceof Error ? err.message : 'Unknown error' }; }
  },
};
