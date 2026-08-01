import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LiveAttendance, AttendanceStatus, AttendanceStats } from './live.types';
import { mapAttendanceRow } from './liveHelpers';

export const attendanceService = {
  async recordJoin(liveClassId: string, studentId: string): Promise<{ data: LiveAttendance | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('live_attendance').upsert({
        live_class_id: liveClassId,
        student_id: studentId,
        join_time: now,
        status: 'present',
      }, { onConflict: 'live_class_id,student_id' }).select('*').maybeSingle();

      if (error) { logger.error('attendanceService.recordJoin', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAttendanceRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async recordLeave(liveClassId: string, studentId: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const now = new Date();

      const { data: existing, error: fetchError } = await supabase.from('live_attendance')
        .select('*')
        .eq('live_class_id', liveClassId)
        .eq('student_id', studentId)
        .maybeSingle();

      if (fetchError) return { error: fetchError.message };
      if (!existing) return { error: 'Attendance record not found' };

      const row = existing as Record<string, unknown>;
      const joinTime = row.join_time ? new Date(row.join_time as string) : now;
      const durationSeconds = Math.floor((now.getTime() - joinTime.getTime()) / 1000);

      const { error } = await supabase.from('live_attendance')
        .update({ leave_time: now.toISOString(), duration_seconds: durationSeconds })
        .eq('live_class_id', liveClassId)
        .eq('student_id', studentId);

      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByClass(liveClassId: string): Promise<{ data: LiveAttendance[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_attendance')
        .select('*, profiles!live_attendance_student_id_fkey(id, full_name, email, avatar_url)')
        .eq('live_class_id', liveClassId)
        .order('join_time', { ascending: false });
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapAttendanceRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudent(studentId: string, limit: number = 50): Promise<{ data: LiveAttendance[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_attendance')
        .select('*, live_classes!live_attendance_live_class_id_fkey(id, title, start_time, end_time)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapAttendanceRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateStatus(liveClassId: string, studentId: string, status: AttendanceStatus, overriddenBy: string): Promise<{ error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('live_attendance')
        .update({ status, manual_override: true, overridden_by: overriddenBy })
        .eq('live_class_id', liveClassId)
        .eq('student_id', studentId);
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStats(liveClassId: string): Promise<{ data: AttendanceStats | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_attendance')
        .select('status')
        .eq('live_class_id', liveClassId);
      if (error) return { data: null, error: error.message };

      const all = (data ?? []) as Array<Record<string, unknown>>;
      const total = all.length;
      const present = all.filter((r) => r.status === 'present').length;
      const absent = all.filter((r) => r.status === 'absent').length;
      const late = all.filter((r) => r.status === 'late').length;
      const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      return { data: { total, present, absent, late, attendanceRate }, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async exportCsv(liveClassId: string): Promise<{ data: string; error: string | null }> {
    try {
      const { data: attendance, error } = await this.getByClass(liveClassId);
      if (error) return { data: '', error };

      const headers = ['Student', 'Email', 'Join Time', 'Leave Time', 'Duration (min)', 'Status', 'Manual Override'];
      const rows = attendance.map((a) => {
        const profile = (a as unknown as Record<string, unknown>).profiles as Record<string, unknown> | undefined;
        const name = profile?.full_name ?? 'Unknown';
        const email = profile?.email ?? '';
        const joinTime = a.joinTime ? new Date(a.joinTime).toLocaleString() : 'N/A';
        const leaveTime = a.leaveTime ? new Date(a.leaveTime).toLocaleString() : 'N/A';
        const duration = Math.floor(a.durationSeconds / 60);
        return [name, email, joinTime, leaveTime, String(duration), a.status, a.manualOverride ? 'Yes' : 'No'];
      });

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      return { data: csv, error: null };
    } catch (err) {
      return { data: '', error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
