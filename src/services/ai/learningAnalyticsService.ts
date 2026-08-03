import { getSupabaseClient } from '@/lib/supabase';
import type { StudySession, CreateStudySessionInput, LearningAnalytics } from './ai.types';
import { mapSessionRow, calculateLearningScore, calculateConsistencyScore } from './aiHelpers';

export const learningAnalyticsService = {
  async getSessions(studentId: string, limit: number = 50): Promise<{ data: StudySession[]; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(limit);
      if (error) return { data: [], error: error.message };
      return { data: (data ?? []).map((r) => mapSessionRow(r as Record<string, unknown>)), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async recordSession(studentId: string, input: CreateStudySessionInput): Promise<{ data: StudySession | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_sessions').insert({
        student_id: studentId,
        session_type: input.sessionType ?? 'mixed',
        duration_minutes: input.durationMinutes,
        subject_id: input.subjectId ?? null,
        chapter_id: input.chapterId ?? null,
        batch_id: input.batchId ?? null,
        video_id: input.videoId ?? null,
        pdf_id: input.pdfId ?? null,
        mcq_id: input.mcqId ?? null,
        items_completed: input.itemsCompleted ?? 0,
        score: input.score ?? null,
        metadata: input.metadata ?? {},
        started_at: input.metadata?.startedAt ?? null,
        ended_at: new Date().toISOString(),
      }).select('*').maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapSessionRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getWeeklyAnalytics(studentId: string): Promise<{ data: LearningAnalytics | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: sessions } = await supabase.from('study_sessions').select('*').eq('student_id', studentId).gte('session_date', weekAgo.toISOString().split('T')[0] ?? '').order('created_at', { ascending: false });
      const allSessions = (sessions ?? []) as Array<Record<string, unknown>>;
      const totalMinutes = allSessions.reduce((sum, s) => sum + Number(s.duration_minutes ?? 0), 0);
      const sessionCount = allSessions.length;
      const avgDuration = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;
      const scoredSessions = allSessions.filter((s) => s.score !== null && s.score !== undefined);
      const avgScore = scoredSessions.length > 0 ? scoredSessions.reduce((sum, s) => sum + Number(s.score), 0) / scoredSessions.length : 0;
      const studyDates = allSessions.map((s) => String(s.session_date));
      const consistency = calculateConsistencyScore(studyDates);
      const learningScore = calculateLearningScore(totalMinutes, sessionCount, avgScore, consistency);
      return {
        data: {
          learningScore, consistencyScore: consistency, completionPercentage: 0,
          totalStudyMinutes: totalMinutes, avgSessionDuration: avgDuration,
          weeklyProgress: totalMinutes, monthlyProgress: totalMinutes,
          sessionCount, totalSessions: sessionCount, studyDaysThisWeek: new Set(studyDates).size,
          bestSubject: null, weakestSubject: null,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getMonthlyAnalytics(studentId: string): Promise<{ data: LearningAnalytics | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
      const { data: sessions } = await supabase.from('study_sessions').select('*').eq('student_id', studentId).gte('session_date', monthAgo.toISOString().split('T')[0] ?? '').order('created_at', { ascending: false });
      const allSessions = (sessions ?? []) as Array<Record<string, unknown>>;
      const totalMinutes = allSessions.reduce((sum, s) => sum + Number(s.duration_minutes ?? 0), 0);
      const sessionCount = allSessions.length;
      const avgDuration = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;
      const scoredSessions = allSessions.filter((s) => s.score !== null && s.score !== undefined);
      const avgScore = scoredSessions.length > 0 ? scoredSessions.reduce((sum, s) => sum + Number(s.score), 0) / scoredSessions.length : 0;
      const studyDates = allSessions.map((s) => String(s.session_date));
      const consistency = calculateConsistencyScore(studyDates);
      const learningScore = calculateLearningScore(totalMinutes, sessionCount, avgScore, consistency);
      return {
        data: {
          learningScore, consistencyScore: consistency, completionPercentage: 0,
          totalStudyMinutes: totalMinutes, avgSessionDuration: avgDuration,
          weeklyProgress: 0, monthlyProgress: totalMinutes,
          sessionCount, totalSessions: sessionCount, studyDaysThisWeek: new Set(studyDates).size,
          bestSubject: null, weakestSubject: null,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getStudyTimeByDay(studentId: string, days: number = 7): Promise<{ data: Array<{ date: string; minutes: number }>; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('study_sessions').select('session_date, duration_minutes').eq('student_id', studentId).gte('session_date', new Date(Date.now() - days * 86400000).toISOString().split('T')[0] ?? '').order('session_date', { ascending: true });
      if (error) return { data: [], error: error.message };
      const allRows = (data ?? []) as Array<Record<string, unknown>>;
      const byDay = new Map<string, number>();
      allRows.forEach((r) => {
        const date = String(r.session_date);
        byDay.set(date, (byDay.get(date) ?? 0) + Number(r.duration_minutes ?? 0));
      });
      return { data: Array.from(byDay.entries()).map(([date, minutes]) => ({ date, minutes })), error: null };
    } catch (err) {
      return { data: [], error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
