export type PredictionType =
  | 'course_completion'
  | 'exam_success'
  | 'drop_risk'
  | 'weak_subjects'
  | 'strong_subjects'
  | 'revision_need'
  | 'learning_speed'
  | 'consistency'
  | 'expected_score'
  | 'expected_rank';

export type PredictionTrend = 'improving' | 'stable' | 'declining';

export type SnapshotPeriod = 'daily' | 'weekly' | 'monthly';

export type RetentionStatus = 'active' | 'at_risk' | 'dormant' | 'churned';

export type ChurnRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface StudentLearningAnalytics {
  id: string;
  studentId: string;
  batchId: string | null;
  totalStudyMinutes: number;
  weeklyStudyMinutes: number;
  monthlyStudyMinutes: number;
  completionPercentage: number;
  attendancePercentage: number;
  mcqAccuracy: number;
  videoCompletionPercentage: number;
  pdfReadingPercentage: number;
  revisionFrequency: number;
  engagementScore: number;
  learningScore: number;
  consistencyScore: number;
  streakDays: number;
  xpTotal: number;
  levelNumber: number;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentPrediction {
  id: string;
  studentId: string;
  predictionType: PredictionType;
  predictedValue: number;
  confidence: number;
  trend: PredictionTrend;
  factors: Record<string, unknown>;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EngagementMetric {
  id: string;
  studentId: string;
  metricDate: string;
  sessionCount: number;
  totalDurationMinutes: number;
  videosWatched: number;
  pdfsRead: number;
  mcqsAttempted: number;
  liveClassesAttended: number;
  interactions: number;
  engagementScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceSnapshot {
  id: string;
  studentId: string;
  batchId: string | null;
  period: SnapshotPeriod;
  periodStart: string;
  periodEnd: string;
  learningScore: number;
  engagementScore: number;
  consistencyScore: number;
  mcqAccuracy: number;
  completionPercentage: number;
  studyMinutes: number;
  attendancePercentage: number;
  trend: PredictionTrend;
  summary: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RetentionMetric {
  id: string;
  studentId: string;
  batchId: string | null;
  enrollmentDate: string;
  lastActivityDate: string | null;
  daysActive: number;
  daysSinceLastActivity: number;
  retentionStatus: RetentionStatus;
  churnRiskLevel: ChurnRiskLevel;
  churnProbability: number;
  reEngagementScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface BatchAnalyticsSummary {
  batchId: string;
  totalStudents: number;
  activeStudents: number;
  averageEngagement: number;
  averageCompletion: number;
  averageScore: number;
  averageAttendance: number;
  retentionRate: number;
  churnRate: number;
  atRiskCount: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalPurchases: number;
  completedPurchases: number;
  pendingPurchases: number;
  failedPurchases: number;
  averageOrderValue: number;
  refundAmount: number;
  topBatches: Array<{ batchId: string; title: string; revenue: number; purchases: number }>;
  monthlyGrowth: Array<{ month: string; revenue: number; purchases: number }>;
}

export interface ContentAnalytics {
  totalVideos: number;
  totalPdfs: number;
  totalMcqs: number;
  totalMcqQuestions: number;
  topVideos: Array<{ videoId: string; title: string; views: number; completionRate: number }>;
  topMcqs: Array<{ mcqSetId: string; title: string; attempts: number; averageScore: number }>;
  videoCompletionRate: number;
  pdfReadRate: number;
  mcqAttemptRate: number;
}

export interface StudentIntelligence {
  studentId: string;
  fullName: string;
  email: string;
  learningScore: number;
  engagementScore: number;
  consistencyScore: number;
  completionPercentage: number;
  mcqAccuracy: number;
  attendancePercentage: number;
  retentionStatus: RetentionStatus;
  churnRiskLevel: ChurnRiskLevel;
  predictedScore: number;
  predictedRank: number;
  dropRisk: number;
  strongSubjects: string[];
  weakSubjects: string[];
  recommendations: string[];
}

export const PREDICTION_TYPE_LABELS: Record<PredictionType, string> = {
  course_completion: 'Course Completion',
  exam_success: 'Exam Success',
  drop_risk: 'Drop Risk',
  weak_subjects: 'Weak Subjects',
  strong_subjects: 'Strong Subjects',
  revision_need: 'Revision Need',
  learning_speed: 'Learning Speed',
  consistency: 'Consistency',
  expected_score: 'Expected Score',
  expected_rank: 'Expected Rank',
};

export const PREDICTION_TREND_LABELS: Record<PredictionTrend, string> = {
  improving: 'Improving',
  stable: 'Stable',
  declining: 'Declining',
};

export const RETENTION_STATUS_LABELS: Record<RetentionStatus, string> = {
  active: 'Active',
  at_risk: 'At Risk',
  dormant: 'Dormant',
  churned: 'Churned',
};

export const CHURN_RISK_LABELS: Record<ChurnRiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  critical: 'Critical Risk',
};

export const SNAPSHOT_PERIOD_LABELS: Record<SnapshotPeriod, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};
