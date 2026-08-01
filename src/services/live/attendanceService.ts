import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { LiveAttendance, AttendanceStatus } from './live.types';
import { mapAttendanceRow } from './liveHelpers';

export const attendanceService = {
  async recordJoin(liveClassId: string, studentId: string): Promise<{ data: LiveAttendance | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();
      const { data, error } = await supabase.from('live_attendance').insert({
        live_class_id: liveClassId,
        student_id: studentId,
        join_time: now,
        status: 'present',
      }).select('*').maybeSingle();
      if (error) { logger.error('attendanceService.recordJoin', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAttendanceRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async recordLeave(attendanceId: string): Promise<{ data: LiveAttendance | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const now = new Date().toISOString();

      const { data: existing, error: fetchError } = await supabase.from('live_attendance').select('*').eq('id', attendanceId).maybeSingle();
      if (fetchError || !existing) return { data: null, error: fetchError?.message ?? 'Attendance record not found' };

      const existingRow = existing as Record<string, unknown>;
      const joinTime = existingRow.join_time ? new Date(String(existingRow.join_time)) : null;
      const durationSeconds = joinTime ? Math.floor((Date.now() - joinTime.getTime()) / 1000) : null;

      const { data, error } = await supabase.from('live_attendance').update({
        leave_time: now,
        duration_seconds: durationSeconds,
        updated_at: now,
      }).eq('id', attendanceId).select('*').maybeSingle();
      if (error) { logger.error('attendanceService.recordLeave', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAttendanceRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByClass(liveClassId: string): Promise<{ data: LiveAttendance[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_attendance').select('*').eq('live_class_id', liveClassId).order('join_time', { ascending: false });
      if (error) { logger.error('attendanceService.getByClass', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapAttendanceRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getByStudent(studentId: string): Promise<{ data: LiveAttendance[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_attendance').select('*').eq('student_id', studentId).order('join_time', { ascending: false });
      if (error) { logger.error('attendanceService.getByStudent', { error: error.message }); return { data: [], error: error.message }; }
      return { data: (data ?? []).map((r) => mapAttendanceRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async updateStatus(attendanceId: string, status: AttendanceStatus, overriddenBy?: string | null): Promise<{ data: LiveAttendance | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('live_attendance').update({
        status,
        manual_override: true,
        overridden_by: overriddenBy ?? null,
        updated_at: new Date().toISOString(),
      }).eq('id', attendanceId).select('*').maybeSingle();
      if (error) { logger.error('attendanceService.updateStatus', { error: error.message }); return { data: null, error: error.message }; }
      return { data: data ? mapAttendanceRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async exportCsv(liveClassId: string): Promise<{ data: string; error: string | null }> {
    try {
      const { data: attendance, error } = await this.getByClass(liveClassId);
      if (error) return { data: '', error };

      const supabase = getSupabaseClient();
      const studentIds = [...new Set(attendance.map((a) => a.studentId))];
      if (studentIds.length === 0) return { data: 'Student ID,Join Time,Leave Time,Duration (seconds),Status\n', error: null };

      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', studentIds);
      const profileMap = new Map<string, string>();
      for (const p of (profiles ?? [])) {
        const row = p as Record<string, unknown>;
        profileMap.set(String(row.id), String(row.full_name ?? 'Unknown'));
      }

      const headers = ['Student ID', 'Student Name', 'Join Time', 'Leave Time', 'Duration (seconds)', 'Status'];
      const rows = attendance.map((a) => [
        a.studentId,
        profileMap.get(a.studentId) ?? 'Unknown',
        a.joinTime ?? '',
        a.leaveTime ?? '',
        String(a.durationSeconds ?? ''),
        a.status,
      ]);

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      return { data: csv, error: null };
    } catch (err) {
      return { data: '', error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getCount(liveClassId: string): Promise<{ data: number; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { count, error } = await supabase.from('live_attendance').select('*', { count: 'exact', head: true }).eq('live_class_id', liveClassId);
      if (error) { logger.error('attendanceService.getCount', { error: error.message }); return { data: 0, error: error.message }; }
      return { data: count ?? 0, error: null };
    } catch (err) {
      return { data: 0, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};