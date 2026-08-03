import type {
  StudentLearningAnalytics,
  StudentPrediction,
  EngagementMetric,
  PerformanceSnapshot,
  RetentionMetric,
  PredictionTrend,
} from './analytics.types';

type LearningAnalyticsRow = {
  id: string;
  student_id: string;
  batch_id: string | null;
  total_study_minutes: number;
  weekly_study_minutes: number;
  monthly_study_minutes: number;
  completion_percentage: number;
  attendance_percentage: number;
  mcq_accuracy: number;
  video_completion_percentage: number;
  pdf_reading_percentage: number;
  revision_frequency: number;
  engagement_score: number;
  learning_score: number;
  consistency_score: number;
  streak_days: number;
  xp_total: number;
  level_number: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
};

type PredictionRow = {
  id: string;
  student_id: string;
  prediction_type: string;
  predicted_value: number;
  confidence: number;
  trend: string;
  factors: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type EngagementRow = {
  id: string;
  student_id: string;
  metric_date: string;
  session_count: number;
  total_duration_minutes: number;
  videos_watched: number;
  pdfs_read: number;
  mcqs_attempted: number;
  live_classes_attended: number;
  interactions: number;
  engagement_score: number;
  created_at: string;
  updated_at: string;
};

type SnapshotRow = {
  id: string;
  student_id: string;
  batch_id: string | null;
  period: string;
  period_start: string;
  period_end: string;
  learning_score: number;
  engagement_score: number;
  consistency_score: number;
  mcq_accuracy: number;
  completion_percentage: number;
  study_minutes: number;
  attendance_percentage: number;
  trend: string;
  summary: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type RetentionRow = {
  id: string;
  student_id: string;
  batch_id: string | null;
  enrollment_date: string;
  last_activity_date: string | null;
  days_active: number;
  days_since_last_activity: number;
  retention_status: string;
  churn_risk_level: string;
  churn_probability: number;
  re_engagement_score: number;
  created_at: string;
  updated_at: string;
};

export function mapLearningAnalytics(row: LearningAnalyticsRow): StudentLearningAnalytics {
  return {
    id: row.id, studentId: row.student_id, batchId: row.batch_id,
    totalStudyMinutes: row.total_study_minutes, weeklyStudyMinutes: row.weekly_study_minutes, monthlyStudyMinutes: row.monthly_study_minutes,
    completionPercentage: Number(row.completion_percentage), attendancePercentage: Number(row.attendance_percentage),
    mcqAccuracy: Number(row.mcq_accuracy), videoCompletionPercentage: Number(row.video_completion_percentage),
    pdfReadingPercentage: Number(row.pdf_reading_percentage), revisionFrequency: Number(row.revision_frequency),
    engagementScore: Number(row.engagement_score), learningScore: Number(row.learning_score), consistencyScore: Number(row.consistency_score),
    streakDays: row.streak_days, xpTotal: row.xp_total, levelNumber: row.level_number,
    lastActivityAt: row.last_activity_at, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function mapPrediction(row: PredictionRow): StudentPrediction {
  return {
    id: row.id, studentId: row.student_id, predictionType: row.prediction_type as StudentPrediction['predictionType'],
    predictedValue: Number(row.predicted_value), confidence: Number(row.confidence), trend: row.trend as PredictionTrend,
    factors: row.factors ?? {}, notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function mapEngagement(row: EngagementRow): EngagementMetric {
  return {
    id: row.id, studentId: row.student_id, metricDate: row.metric_date, sessionCount: row.session_count,
    totalDurationMinutes: row.total_duration_minutes, videosWatched: row.videos_watched, pdfsRead: row.pdfs_read,
    mcqsAttempted: row.mcqs_attempted, liveClassesAttended: row.live_classes_attended, interactions: row.interactions,
    engagementScore: Number(row.engagement_score), createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function mapSnapshot(row: SnapshotRow): PerformanceSnapshot {
  return {
    id: row.id, studentId: row.student_id, batchId: row.batch_id, period: row.period as PerformanceSnapshot['period'],
    periodStart: row.period_start, periodEnd: row.period_end, learningScore: Number(row.learning_score),
    engagementScore: Number(row.engagement_score), consistencyScore: Number(row.consistency_score),
    mcqAccuracy: Number(row.mcq_accuracy), completionPercentage: Number(row.completion_percentage),
    studyMinutes: row.study_minutes, attendancePercentage: Number(row.attendance_percentage),
    trend: row.trend as PredictionTrend, summary: row.summary ?? {}, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function mapRetention(row: RetentionRow): RetentionMetric {
  return {
    id: row.id, studentId: row.student_id, batchId: row.batch_id, enrollmentDate: row.enrollment_date,
    lastActivityDate: row.last_activity_date, daysActive: row.days_active, daysSinceLastActivity: row.days_since_last_activity,
    retentionStatus: row.retention_status as RetentionMetric['retentionStatus'],
    churnRiskLevel: row.churn_risk_level as RetentionMetric['churnRiskLevel'],
    churnProbability: Number(row.churn_probability), reEngagementScore: Number(row.re_engagement_score),
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export function calculateEngagementScore(metrics: {
  sessionCount: number; totalDurationMinutes: number; videosWatched: number; pdfsRead: number;
  mcqsAttempted: number; liveClassesAttended: number; interactions: number;
}): number {
  const durationScore = Math.min(metrics.totalDurationMinutes / 60, 100) * 0.3;
  const activityScore = Math.min(metrics.videosWatched + metrics.pdfsRead + metrics.mcqsAttempted + metrics.liveClassesAttended, 20) * 2.5;
  const interactionScore = Math.min(metrics.interactions, 50) * 0.9;
  return Math.min(durationScore + activityScore + interactionScore, 100);
}

export function calculateDropRisk(params: {
  daysSinceLastActivity: number; completionPercentage: number; engagementScore: number; consistencyScore: number;
}): number {
  const inactivityWeight = Math.min(params.daysSinceLastActivity / 30, 1) * 40;
  const lowEngagementWeight = (100 - params.engagementScore) * 0.25;
  const lowConsistencyWeight = (100 - params.consistencyScore) * 0.2;
  const lowCompletionWeight = (100 - params.completionPercentage) * 0.15;
  return Math.min(inactivityWeight + lowEngagementWeight + lowConsistencyWeight + lowCompletionWeight, 100);
}

export function calculateRetentionStatus(daysSinceLastActivity: number): {
  status: 'active' | 'at_risk' | 'dormant' | 'churned'; riskLevel: 'low' | 'medium' | 'high' | 'critical';
} {
  if (daysSinceLastActivity <= 3) return { status: 'active', riskLevel: 'low' };
  if (daysSinceLastActivity <= 7) return { status: 'active', riskLevel: 'low' };
  if (daysSinceLastActivity <= 14) return { status: 'at_risk', riskLevel: 'medium' };
  if (daysSinceLastActivity <= 30) return { status: 'dormant', riskLevel: 'high' };
  return { status: 'churned', riskLevel: 'critical' };
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60); const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatPercentage(value: number): string { return `${value.toFixed(1)}%`; }
