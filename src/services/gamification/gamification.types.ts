export type CertificateType = 'course_completion' | 'batch_completion' | 'live_class' | 'custom';
export type CertificateStatus = 'active' | 'revoked' | 'expired';
export type AchievementCategory = 'learning' | 'mcq' | 'attendance' | 'streak' | 'social' | 'special';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend' | 'special';
export type MissionType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type MissionAction = 'watch_video' | 'complete_class' | 'read_pdf' | 'attempt_mcq' | 'pass_mcq' | 'join_live' | 'finish_chapter' | 'finish_subject' | 'finish_batch' | 'custom';
export type RewardType = 'awarded' | 'redeemed' | 'bonus' | 'referral' | 'leaderboard_bonus';
export type LeaderboardCategory = 'xp' | 'mcq' | 'attendance' | 'live_class';
export type LeaderboardPeriod = 'global' | 'weekly' | 'monthly' | 'yearly';

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  backgroundUrl: string | null;
  logoUrl: string | null;
  signatureUrl: string | null;
  stampUrl: string | null;
  templateConfig: Record<string, unknown>;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  studentId: string;
  batchId: string | null;
  templateId: string | null;
  type: CertificateType;
  status: CertificateStatus;
  studentName: string;
  batchName: string | null;
  courseName: string | null;
  instructorName: string | null;
  completionDate: string;
  expiryDate: string | null;
  issuedBy: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateVerification {
  id: string;
  certificateId: string;
  verifiedBy: string | null;
  verifiedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: AchievementCategory;
  criteria: Record<string, unknown>;
  xpReward: number;
  pointsReward: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  achievementId: string;
  awardedAt: string;
  awardedBy: string | null;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  tier: BadgeTier;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentBadge {
  id: string;
  studentId: string;
  badgeId: string;
  awardedAt: string;
  awardedBy: string | null;
  createdAt: string;
}

export interface StudentXp {
  id: string;
  studentId: string;
  totalXp: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentLevel {
  id: string;
  studentId: string;
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyStreak {
  id: string;
  studentId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  freezeDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string | null;
  type: MissionType;
  action: MissionAction;
  targetCount: number;
  xpReward: number;
  pointsReward: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentMission {
  id: string;
  studentId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  isRewardClaimed: boolean;
  completedAt: string | null;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RewardPoint {
  id: string;
  studentId: string;
  type: RewardType;
  points: number;
  balance: number;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  studentId: string;
  studentName: string;
  avatarUrl: string | null;
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  batchId: string | null;
  score: number;
  rank: number;
  periodStart: string | null;
  periodEnd: string | null;
  updatedAt: string;
}

export interface CreateCertificateInput {
  studentId: string;
  batchId?: string | null;
  templateId?: string | null;
  type?: CertificateType;
  studentName: string;
  batchName?: string | null;
  courseName?: string | null;
  instructorName?: string | null;
  completionDate?: string;
  expiryDate?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CreateTemplateInput {
  name: string;
  description?: string | null;
  backgroundUrl?: string | null;
  logoUrl?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
  templateConfig?: Record<string, unknown>;
}

export interface CreateAchievementInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  category?: AchievementCategory;
  criteria?: Record<string, unknown>;
  xpReward?: number;
  pointsReward?: number;
}

export interface CreateBadgeInput {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  tier?: BadgeTier;
}

export interface CreateMissionInput {
  name: string;
  description?: string | null;
  type?: MissionType;
  action?: MissionAction;
  targetCount?: number;
  xpReward?: number;
  pointsReward?: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface AwardXpInput {
  studentId: string;
  amount: number;
  reason: string;
}

export interface AwardPointsInput {
  studentId: string;
  amount: number;
  type?: RewardType;
  description?: string | null;
  referenceId?: string | null;
}

export interface GamificationStats {
  totalXp: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  currentStreak: number;
  longestStreak: number;
  totalBadges: number;
  totalAchievements: number;
  totalCertificates: number;
  rewardPointsBalance: number;
  completedMissions: number;
}

export interface LeaderboardFilter {
  category?: LeaderboardCategory;
  period?: LeaderboardPeriod;
  batchId?: string | null;
  limit?: number;
}