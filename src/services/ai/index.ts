export { aiAssistantService } from './aiAssistantService';
export { studyPlannerService } from './studyPlannerService';
export { recommendationService } from './recommendationService';
export { revisionService } from './revisionService';
export { learningInsightsService } from './learningInsightsService';
export { goalTrackingService } from './goalTrackingService';
export { learningAnalyticsService } from './learningAnalyticsService';

export {
  SESSION_TYPE_LABELS, SESSION_TYPE_ICONS,
  RECOMMENDATION_TYPE_LABELS, RECOMMENDATION_PRIORITY_LABELS, RECOMMENDATION_PRIORITY_COLORS,
  INSIGHT_TYPE_LABELS, INSIGHT_SEVERITY_LABELS, INSIGHT_SEVERITY_COLORS,
  DAILY_TARGET_TYPE_LABELS, GOAL_PERIOD_LABELS,
  calculateLearningScore, calculateConsistencyScore, calculateSpacedRepetitionInterval,
  predictPerformance, formatMinutes, getProgressPercentage,
  getScoreColor, getSeverityColor,
} from './aiHelpers';

export type {
  StudySessionType, RecommendationType, RecommendationPriority,
  InsightType, InsightSeverity, DailyTargetType, GoalPeriod,
  AiLearningProfile, StudyGoal, StudySession,
  LearningRecommendation, RevisionItem, WeakTopic, LearningInsight, DailyTarget,
  CreateStudyGoalInput, CreateStudySessionInput, CreateRecommendationInput,
  CreateRevisionInput, CreateWeakTopicInput, CreateInsightInput, CreateDailyTargetInput,
  LearningAnalytics, AiStudyPlan, PerformancePrediction,
} from './ai.types';
