import { useState, useEffect, useCallback } from 'react';
import { aiAssistantService } from '@/services/ai';
import type { AiLearningProfile, LearningAnalytics, PerformancePrediction, AiStudyPlan } from '@/services/ai';

export function useAiAssistant(studentId: string | null) {
  const [profile, setProfile] = useState<AiLearningProfile | null>(null);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [prediction, setPrediction] = useState<PerformancePrediction | null>(null);
  const [studyPlan, setStudyPlan] = useState<AiStudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const [profileRes, analyticsRes, predictionRes, planRes] = await Promise.all([
      aiAssistantService.getProfile(studentId),
      aiAssistantService.getAnalytics(studentId),
      aiAssistantService.getPrediction(studentId),
      aiAssistantService.generateStudyPlan(studentId),
    ]);
    if (profileRes.error) setError(profileRes.error);
    else { setProfile(profileRes.data); setError(null); }
    setAnalytics(analyticsRes.data);
    setPrediction(predictionRes.data);
    setStudyPlan(planRes.data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const analyze = useCallback(async () => {
    if (!studentId) return;
    const { data, error: err } = await aiAssistantService.analyzeProfile(studentId);
    if (!err) setProfile(data);
    return { data, error: err };
  }, [studentId]);

  return { profile, analytics, prediction, studyPlan, loading, error, analyze, refetch: fetchAll };
}
