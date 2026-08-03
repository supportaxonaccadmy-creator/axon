import { getSupabaseClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { AiLearningProfile, LearningAnalytics, PerformancePrediction, AiStudyPlan } from './ai.types';
import { mapProfileRow, calculateLearningScore, calculateConsistencyScore, predictPerformance } from './aiHelpers';

export const aiAssistantService = {
  async getProfile(studentId: string): Promise<{ data: AiLearningProfile | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from('ai_learning_profiles').select('*').eq('student_id', studentId).maybeSingle();
      if (error) return { data: null, error: error.message };
      return { data: data ? mapProfileRow(data as Record<string, unknown>) : null, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async analyzeProfile(studentId: string): Promise<{ data: AiLearningProfile | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: sessions } = await supabase.from('study_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
      const allSessions = (sessions ?? []) as Array<Record<string, unknown>>;
      const totalMinutes = allSessions.reduce((sum, s) => sum + Number(s.duration_minutes ?? 0), 0);
      const sessionCount = allSessions.length;
      const avgDuration = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;
      const scoredSessions = allSessions.filter((s) => s.score !== null && s.score !== undefined);
      const avgScore = scoredSessions.length > 0 ? scoredSessions.reduce((sum, s) => sum + Number(s.score), 0) / scoredSessions.length : 0;
      const studyDates = allSessions.map((s) => String(s.session_date));
      const consistency = calculateConsistencyScore(studyDates);
      const learningScore = calculateLearningScore(totalMinutes, sessionCount, avgScore, consistency);

      const { data: existing } = await supabase.from('ai_learning_profiles').select('*').eq('student_id', studentId).maybeSingle();
      const updateData = {
        learning_score: learningScore,
        consistency_score: consistency,
        avg_session_duration: avgDuration,
        total_study_minutes: totalMinutes,
        last_analyzed_at: new Date().toISOString(),
      };
      if (existing) {
        const { data, error } = await supabase.from('ai_learning_profiles').update(updateData).eq('student_id', studentId).select('*').maybeSingle();
        if (error) { logger.error('aiAssistantService.analyzeProfile', { error: error.message }); return { data: null, error: error.message }; }
        return { data: data ? mapProfileRow(data as Record<string, unknown>) : null, error: null };
      } else {
        const { data, error } = await supabase.from('ai_learning_profiles').insert({ student_id: studentId, ...updateData }).select('*').maybeSingle();
        if (error) { logger.error('aiAssistantService.analyzeProfile insert', { error: error.message }); return { data: null, error: error.message }; }
        return { data: data ? mapProfileRow(data as Record<string, unknown>) : null, error: null };
      }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getAnalytics(studentId: string): Promise<{ data: LearningAnalytics | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: sessions } = await supabase.from('study_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
      const allSessions = (sessions ?? []) as Array<Record<string, unknown>>;
      const totalMinutes = allSessions.reduce((sum, s) => sum + Number(s.duration_minutes ?? 0), 0);
      const sessionCount = allSessions.length;
      const avgDuration = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;
      const scoredSessions = allSessions.filter((s) => s.score !== null && s.score !== undefined);
      const avgScore = scoredSessions.length > 0 ? scoredSessions.reduce((sum, s) => sum + Number(s.score), 0) / scoredSessions.length : 0;
      const studyDates = allSessions.map((s) => String(s.session_date));
      const consistency = calculateConsistencyScore(studyDates);
      const learningScore = calculateLearningScore(totalMinutes, sessionCount, avgScore, consistency);

      const now = new Date();
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);
      const weeklySessions = allSessions.filter((s) => new Date(String(s.session_date)) >= weekAgo);
      const monthlySessions = allSessions.filter((s) => new Date(String(s.session_date)) >= monthAgo);
      const weeklyProgress = weeklySessions.reduce((sum, s) => sum + Number(s.duration_minutes ?? 0), 0);
      const monthlyProgress = monthlySessions.reduce((sum, s) => sum + Number(s.duration_minutes ?? 0), 0);
      const studyDaysThisWeek = new Set(weeklySessions.map((s) => String(s.session_date))).size;

      return {
        data: {
          learningScore, consistencyScore: consistency, completionPercentage: 0,
          totalStudyMinutes: totalMinutes, avgSessionDuration: avgDuration,
          weeklyProgress, monthlyProgress, sessionCount, totalSessions: sessionCount,
          studyDaysThisWeek, bestSubject: null, weakestSubject: null,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async getPrediction(studentId: string): Promise<{ data: PerformancePrediction | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const { data: sessions } = await supabase.from('study_sessions').select('*').eq('student_id', studentId).order('created_at', { ascending: false }).limit(20);
      const allSessions = (sessions ?? []) as Array<Record<string, unknown>>;
      const scoredSessions = allSessions.filter((s) => s.score !== null && s.score !== undefined).map((s) => Number(s.score)).reverse();
      const totalMinutes = allSessions.reduce((sum, s) => sum + Number(s.duration_minutes ?? 0), 0);
      const studyDates = allSessions.map((s) => String(s.session_date));
      const consistency = calculateConsistencyScore(studyDates);
      const prediction = predictPerformance(scoredSessions, totalMinutes, consistency);
      return { data: prediction, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  async generateStudyPlan(studentId: string): Promise<{ data: AiStudyPlan | null; error: string | null }> {
    try {
      const supabase = getSupabaseClient();
      const today = new Date().toISOString().split('T')[0] ?? '';
      const { data: targets } = await supabase.from('daily_targets').select('*').eq('student_id', studentId).eq('target_date', today);
      const { data: recs } = await supabase.from('learning_recommendations').select('*').eq('student_id', studentId).eq('is_dismissed', false).order('priority', { ascending: false }).limit(5);
      const { data: weak } = await supabase.from('weak_topics').select('*').eq('student_id', studentId).eq('is_resolved', false).order('accuracy_percentage', { ascending: true }).limit(5);
      const { data: revisions } = await supabase.from('revision_schedule').select('*').eq('student_id', studentId).eq('is_completed', false).lte('next_revision_date', today).order('next_revision_date', { ascending: true }).limit(5);
      const dailyTargets = (targets ?? []).map((r) => mapDailyTargetRow(r as Record<string, unknown>));
      const recommendations = (recs ?? []).map((r) => mapRecommendationRow(r as Record<string, unknown>));
      const weakTopics = (weak ?? []).map((r) => mapWeakTopicRow(r as Record<string, unknown>));
      const revisionItems = (revisions ?? []).map((r) => mapRevisionRow(r as Record<string, unknown>));
      const estimatedMinutes = dailyTargets.reduce((sum, t) => sum + (t.targetType === 'video' ? 20 : t.targetType === 'pdf' ? 15 : t.targetType === 'mcq' ? 10 : t.targetType === 'revision' ? 15 : 30) * t.targetCount, 0);
      const focus = weakTopics.length > 0 ? weakTopics[0]?.topicName ?? 'General Study' : 'Continue Learning';
      return { data: { date: today, targets: dailyTargets, recommendations, weakTopics, revisionItems, estimatedMinutes, focus }, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};

import { mapDailyTargetRow, mapRecommendationRow, mapWeakTopicRow, mapRevisionRow } from './aiHelpers';
