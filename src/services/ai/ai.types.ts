export type StudySessionType = 'video' | 'pdf' | 'mcq' | 'live' | 'revision' | 'mixed';
export type RecommendationType = 'video' | 'pdf' | 'mcq' | 'live_class' | 'course' | 'chapter' | 'revision';
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type InsightType = 'strength' | 'weakness' | 'trend' | 'suggestion' | 'prediction';
export type InsightSeverity = 'info' | 'warning' | 'critical' | 'positive';
export type DailyTargetType = 'video' | 'pdf' | 'mcq' | 'revision' | 'live';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

export interface AiLearningProfile {
  id: string;
  studentId: string;
  learningScore: number;
  consistencyScore: number;
  completionPercentage: number;
  preferredStudyTime: string | null;
  avgSessionDuration: number;
  totalStudyMinutes: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: string | null;
  lastAnalyzedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  studentId: string;
  period: GoalPeriod;
  targetMinutes: number;
  targetChapters: number;
  targetMcqs: number;
  targetVideos: number;
  achievedMinutes: number;
  achievedChapters: number;
  achievedMcqs: number;
  achievedVideos: number;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  studentId: string;
  sessionType: StudySessionType;
  durationMinutes: number;
  subjectId: string | null;
  chapterId: string | null;
  batchId: string | null;
  videoId: string | null;
  pdfId: string | null;
  mcqId: string | null;
  itemsCompleted: number;
  score: number | null;
  metadata: Record<string, unknown>;
  sessionDate: string;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

export interface LearningRecommendation {
  id: string;
  studentId: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string | null;
  reason: string | null;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown>;
  isDismissed: boolean;
  isCompleted: boolean;
  score: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionItem {
  id: string;
  studentId: string;
  subjectId: string | null;
  chapterId: string | null;
  batchId: string | null;
  topicName: string;
  nextRevisionDate: string;
  lastRevisedAt: string | null;
  revisionCount: number;
  intervalDays: number;
  confidenceScore: number;
  isCompleted: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WeakTopic {
  id: string;
  studentId: string;
  subjectId: string | null;
  chapterId: string | null;
  batchId: string | null;
  topicName: string;
  severity: RecommendationPriority;
  confidenceScore: number;
  accuracyPercentage: number;
  attemptCount: number;
  correctCount: number;
  suggestedActions: string[];
  isResolved: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LearningInsight {
  id: string;
  studentId: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string | null;
  actionableAdvice: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface DailyTarget {
  id: string;
  studentId: string;
  targetDate: string;
  targetType: DailyTargetType;
  targetCount: number;
  completedCount: number;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudyGoalInput {
  period?: GoalPeriod;
  targetMinutes?: number;
  targetChapters?: number;
  targetMcqs?: number;
  targetVideos?: number;
  endDate?: string | null;
}

export interface CreateStudySessionInput {
  sessionType?: StudySessionType;
  durationMinutes: number;
  subjectId?: string | null;
  chapterId?: string | null;
  batchId?: string | null;
  videoId?: string | null;
  pdfId?: string | null;
  mcqId?: string | null;
  itemsCompleted?: number;
  score?: number | null;
  metadata?: Record<string, unknown>;
}

export interface CreateRecommendationInput {
  type: RecommendationType;
  priority?: RecommendationPriority;
  title: string;
  description?: string | null;
  reason?: string | null;
  referenceId?: string | null;
  referenceType?: string | null;
  metadata?: Record<string, unknown>;
  score?: number;
  expiresAt?: string | null;
}

export interface CreateRevisionInput {
  subjectId?: string | null;
  chapterId?: string | null;
  batchId?: string | null;
  topicName: string;
  nextRevisionDate?: string;
  intervalDays?: number;
  confidenceScore?: number;
}

export interface CreateWeakTopicInput {
  subjectId?: string | null;
  chapterId?: string | null;
  batchId?: string | null;
  topicName: string;
  severity?: RecommendationPriority;
  accuracyPercentage?: number;
  attemptCount?: number;
  correctCount?: number;
  suggestedActions?: string[];
}

export interface CreateInsightInput {
  type: InsightType;
  severity?: InsightSeverity;
  title: string;
  description?: string | null;
  actionableAdvice?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CreateDailyTargetInput {
  targetDate?: string;
  targetType: DailyTargetType;
  targetCount: number;
  referenceId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface LearningAnalytics {
  learningScore: number;
  consistencyScore: number;
  completionPercentage: number;
  totalStudyMinutes: number;
  avgSessionDuration: number;
  weeklyProgress: number;
  monthlyProgress: number;
  sessionCount: number;
  totalSessions: number;
  studyDaysThisWeek: number;
  bestSubject: string | null;
  weakestSubject: string | null;
}

export interface AiStudyPlan {
  date: string;
  targets: DailyTarget[];
  recommendations: LearningRecommendation[];
  weakTopics: WeakTopic[];
  revisionItems: RevisionItem[];
  estimatedMinutes: number;
  focus: string;
}

export interface PerformancePrediction {
  predictedScore: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'declining';
  factors: string[];
  recommendation: string;
}
