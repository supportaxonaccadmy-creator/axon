import type {
  StudySessionType, RecommendationType, RecommendationPriority,
  InsightType, InsightSeverity, DailyTargetType, GoalPeriod,
} from './ai.types';

export const SESSION_TYPE_LABELS: Record<StudySessionType, string> = {
  video: 'Video Learning',
  pdf: 'Reading PDF',
  mcq: 'MCQ Practice',
  live: 'Live Class',
  revision: 'Revision',
  mixed: 'Mixed Study',
};

export const SESSION_TYPE_ICONS: Record<StudySessionType, string> = {
  video: 'Video',
  pdf: 'FileText',
  mcq: 'HelpCircle',
  live: 'Radio',
  revision: 'RotateCw',
  mixed: 'BookOpen',
};

export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, string> = {
  video: 'Watch Video',
  pdf: 'Read PDF',
  mcq: 'Practice MCQ',
  live_class: 'Join Live Class',
  course: 'Enroll Course',
  chapter: 'Study Chapter',
  revision: 'Revise Topic',
};

export const RECOMMENDATION_PRIORITY_LABELS: Record<RecommendationPriority, string> = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority',
  urgent: 'Urgent',
};

export const RECOMMENDATION_PRIORITY_COLORS: Record<RecommendationPriority, string> = {
  low: 'bg-neutral-100 text-neutral-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const INSIGHT_TYPE_LABELS: Record<InsightType, string> = {
  strength: 'Strength',
  weakness: 'Weakness',
  trend: 'Trend',
  suggestion: 'Suggestion',
  prediction: 'Prediction',
};

export const INSIGHT_SEVERITY_LABELS: Record<InsightSeverity, string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
  positive: 'Positive',
};

export const INSIGHT_SEVERITY_COLORS: Record<InsightSeverity, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
  positive: 'bg-green-100 text-green-700',
};

export const DAILY_TARGET_TYPE_LABELS: Record<DailyTargetType, string> = {
  video: 'Watch Videos',
  pdf: 'Read PDFs',
  mcq: 'Practice MCQs',
  revision: 'Revise Topics',
  live: 'Join Live Class',
};

export const GOAL_PERIOD_LABELS: Record<GoalPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export function calculateLearningScore(
  totalMinutes: number,
  sessionCount: number,
  avgScore: number,
  consistency: number,
): number {
  const volumeScore = Math.min(40, (totalMinutes / 1000) * 40);
  const engagementScore = Math.min(30, (sessionCount / 50) * 30);
  const performanceScore = Math.min(20, (avgScore / 100) * 20);
  const consistencyScore = Math.min(10, (consistency / 100) * 10);
  return Math.round((volumeScore + engagementScore + performanceScore + consistencyScore) * 100) / 100;
}

export function calculateConsistencyScore(studyDates: string[]): number {
  if (studyDates.length === 0) return 0;
  const uniqueDates = new Set(studyDates);
  const today = new Date();
  const last7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0] ?? '');
  }
  const activeDays = last7Days.filter((d) => uniqueDates.has(d)).length;
  return Math.round((activeDays / 7) * 100);
}

export function calculateSpacedRepetitionInterval(revisionCount: number, confidenceScore: number): number {
  const baseIntervals = [1, 3, 7, 14, 30, 60];
  const idx = Math.min(revisionCount, baseIntervals.length - 1);
  const baseInterval = baseIntervals[idx] ?? 1;
  const confidenceMultiplier = confidenceScore > 0.7 ? 1.5 : confidenceScore > 0.5 ? 1.0 : 0.7;
  return Math.max(1, Math.round(baseInterval * confidenceMultiplier));
}

export function predictPerformance(
  recentScores: number[],
  studyMinutes: number,
  consistencyScore: number,
): { predictedScore: number; confidence: number; trend: 'improving' | 'stable' | 'declining'; factors: string[]; recommendation: string } {
  const avgScore = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
  const lastScore = recentScores[recentScores.length - 1] ?? 0;
  const firstScore = recentScores[0] ?? 0;
  const trend = recentScores.length >= 2 && lastScore > firstScore ? 'improving' : recentScores.length >= 2 && lastScore < firstScore ? 'declining' : 'stable';
  const volumeBoost = Math.min(10, studyMinutes / 500 * 10);
  const consistencyBoost = (consistencyScore / 100) * 10;
  const predictedScore = Math.min(100, Math.round(avgScore + volumeBoost + consistencyBoost));
  const confidence = Math.min(95, 50 + recentScores.length * 5 + consistencyScore * 0.2);
  const factors: string[] = [];
  if (consistencyScore > 70) factors.push('High study consistency');
  if (studyMinutes > 500) factors.push('Good study volume');
  if (trend === 'improving') factors.push('Improving score trend');
  if (trend === 'declining') factors.push('Declining score trend');
  if (recentScores.length < 3) factors.push('Limited data points');
  const recommendation = trend === 'improving' ? 'Keep up the great work! Your performance is trending upward.' : trend === 'declining' ? 'Focus on weak topics and increase study time to reverse the decline.' : 'Maintain your current pace and focus on weak areas for improvement.';
  return { predictedScore, confidence, trend, factors, recommendation };
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getProgressPercentage(achieved: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((achieved / target) * 100));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getSeverityColor(severity: RecommendationPriority): string {
  return RECOMMENDATION_PRIORITY_COLORS[severity];
}

export function mapProfileRow(row: Record<string, unknown>): import('./ai.types').AiLearningProfile {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    learningScore: Number(row.learning_score ?? 0),
    consistencyScore: Number(row.consistency_score ?? 0),
    completionPercentage: Number(row.completion_percentage ?? 0),
    preferredStudyTime: (row.preferred_study_time as string | null) ?? null,
    avgSessionDuration: Number(row.avg_session_duration ?? 0),
    totalStudyMinutes: Number(row.total_study_minutes ?? 0),
    strengths: Array.isArray(row.strengths) ? (row.strengths as string[]) : [],
    weaknesses: Array.isArray(row.weaknesses) ? (row.weaknesses as string[]) : [],
    learningStyle: (row.learning_style as string | null) ?? null,
    lastAnalyzedAt: (row.last_analyzed_at as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapGoalRow(row: Record<string, unknown>): import('./ai.types').StudyGoal {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    period: row.period as GoalPeriod,
    targetMinutes: Number(row.target_minutes ?? 60),
    targetChapters: Number(row.target_chapters ?? 1),
    targetMcqs: Number(row.target_mcqs ?? 10),
    targetVideos: Number(row.target_videos ?? 2),
    achievedMinutes: Number(row.achieved_minutes ?? 0),
    achievedChapters: Number(row.achieved_chapters ?? 0),
    achievedMcqs: Number(row.achieved_mcqs ?? 0),
    achievedVideos: Number(row.achieved_videos ?? 0),
    isActive: Boolean(row.is_active),
    startDate: String(row.start_date),
    endDate: (row.end_date as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapSessionRow(row: Record<string, unknown>): import('./ai.types').StudySession {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    sessionType: row.session_type as StudySessionType,
    durationMinutes: Number(row.duration_minutes ?? 0),
    subjectId: (row.subject_id as string | null) ?? null,
    chapterId: (row.chapter_id as string | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    videoId: (row.video_id as string | null) ?? null,
    pdfId: (row.pdf_id as string | null) ?? null,
    mcqId: (row.mcq_id as string | null) ?? null,
    itemsCompleted: Number(row.items_completed ?? 0),
    score: row.score !== null && row.score !== undefined ? Number(row.score) : null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    sessionDate: String(row.session_date),
    startedAt: (row.started_at as string | null) ?? null,
    endedAt: (row.ended_at as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export function mapRecommendationRow(row: Record<string, unknown>): import('./ai.types').LearningRecommendation {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    type: row.type as RecommendationType,
    priority: row.priority as RecommendationPriority,
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    reason: (row.reason as string | null) ?? null,
    referenceId: (row.reference_id as string | null) ?? null,
    referenceType: (row.reference_type as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    isDismissed: Boolean(row.is_dismissed),
    isCompleted: Boolean(row.is_completed),
    score: Number(row.score ?? 0),
    expiresAt: (row.expires_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapRevisionRow(row: Record<string, unknown>): import('./ai.types').RevisionItem {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    subjectId: (row.subject_id as string | null) ?? null,
    chapterId: (row.chapter_id as string | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    topicName: String(row.topic_name),
    nextRevisionDate: String(row.next_revision_date),
    lastRevisedAt: (row.last_revised_at as string | null) ?? null,
    revisionCount: Number(row.revision_count ?? 0),
    intervalDays: Number(row.interval_days ?? 1),
    confidenceScore: Number(row.confidence_score ?? 0.5),
    isCompleted: Boolean(row.is_completed),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapWeakTopicRow(row: Record<string, unknown>): import('./ai.types').WeakTopic {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    subjectId: (row.subject_id as string | null) ?? null,
    chapterId: (row.chapter_id as string | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    topicName: String(row.topic_name),
    severity: row.severity as RecommendationPriority,
    confidenceScore: Number(row.confidence_score ?? 0.5),
    accuracyPercentage: Number(row.accuracy_percentage ?? 0),
    attemptCount: Number(row.attempt_count ?? 0),
    correctCount: Number(row.correct_count ?? 0),
    suggestedActions: Array.isArray(row.suggested_actions) ? (row.suggested_actions as string[]) : [],
    isResolved: Boolean(row.is_resolved),
    resolvedAt: (row.resolved_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapInsightRow(row: Record<string, unknown>): import('./ai.types').LearningInsight {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    type: row.type as InsightType,
    severity: row.severity as InsightSeverity,
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    actionableAdvice: (row.actionable_advice as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    isRead: Boolean(row.is_read),
    createdAt: String(row.created_at),
  };
}

export function mapDailyTargetRow(row: Record<string, unknown>): import('./ai.types').DailyTarget {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    targetDate: String(row.target_date),
    targetType: row.target_type as DailyTargetType,
    targetCount: Number(row.target_count ?? 1),
    completedCount: Number(row.completed_count ?? 0),
    referenceId: (row.reference_id as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    isCompleted: Boolean(row.is_completed),
    completedAt: (row.completed_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}
