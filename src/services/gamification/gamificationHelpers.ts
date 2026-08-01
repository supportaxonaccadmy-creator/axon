import type {
  CertificateType, CertificateStatus, AchievementCategory,
  BadgeTier, MissionType, MissionAction, RewardType,
  LeaderboardCategory, LeaderboardPeriod,
  Certificate, CertificateTemplate, Achievement, Badge, Mission,
  StudentMission, RewardPoint, LeaderboardEntry, StudentXp, StudentLevel, StudyStreak,
} from './gamification.types';

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  course_completion: 'Course Completion',
  batch_completion: 'Batch Completion',
  live_class: 'Live Class',
  custom: 'Custom',
};

export const CERTIFICATE_STATUS_LABELS: Record<CertificateStatus, string> = {
  active: 'Active',
  revoked: 'Revoked',
  expired: 'Expired',
};

export const CERTIFICATE_STATUS_COLORS: Record<CertificateStatus, string> = {
  active: 'bg-green-100 text-green-700',
  revoked: 'bg-red-100 text-red-700',
  expired: 'bg-neutral-100 text-neutral-500',
};

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  learning: 'Learning',
  mcq: 'MCQ Practice',
  attendance: 'Attendance',
  streak: 'Study Streak',
  social: 'Social',
  special: 'Special',
};

export const ACHIEVEMENT_CATEGORY_COLORS: Record<AchievementCategory, string> = {
  learning: 'bg-blue-100 text-blue-700',
  mcq: 'bg-purple-100 text-purple-700',
  attendance: 'bg-green-100 text-green-700',
  streak: 'bg-orange-100 text-orange-700',
  social: 'bg-pink-100 text-pink-700',
  special: 'bg-amber-100 text-amber-700',
};

export const BADGE_TIER_LABELS: Record<BadgeTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',
  legend: 'Legend',
  special: 'Special',
};

export const BADGE_TIER_COLORS: Record<BadgeTier, string> = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-gray-300 to-gray-500',
  gold: 'from-yellow-400 to-yellow-600',
  diamond: 'from-cyan-300 to-blue-500',
  legend: 'from-purple-500 to-purple-800',
  special: 'from-pink-400 to-rose-600',
};

export const BADGE_TIER_TEXT_COLORS: Record<BadgeTier, string> = {
  bronze: 'text-amber-700',
  silver: 'text-gray-500',
  gold: 'text-yellow-600',
  diamond: 'text-cyan-500',
  legend: 'text-purple-600',
  special: 'text-pink-500',
};

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

export const MISSION_ACTION_LABELS: Record<MissionAction, string> = {
  watch_video: 'Watch Videos',
  complete_class: 'Complete Classes',
  read_pdf: 'Read PDFs',
  attempt_mcq: 'Attempt MCQs',
  pass_mcq: 'Pass MCQs',
  join_live: 'Join Live Classes',
  finish_chapter: 'Finish Chapters',
  finish_subject: 'Finish Subjects',
  finish_batch: 'Finish Batches',
  custom: 'Custom Action',
};

export const REWARD_TYPE_LABELS: Record<RewardType, string> = {
  awarded: 'Awarded',
  redeemed: 'Redeemed',
  bonus: 'Bonus',
  referral: 'Referral',
  leaderboard_bonus: 'Leaderboard Bonus',
};

export const LEADERBOARD_CATEGORY_LABELS: Record<LeaderboardCategory, string> = {
  xp: 'XP',
  mcq: 'MCQ Score',
  attendance: 'Attendance',
  live_class: 'Live Class',
};

export const LEADERBOARD_PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  global: 'All Time',
  weekly: 'This Week',
  monthly: 'This Month',
  yearly: 'This Year',
};

export function generateCertificateNumber(): string {
  const prefix = 'CERT';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 14).toUpperCase();
}

export function calculateLevel(totalXp: number): { level: number; xpForCurrent: number; xpForNext: number } {
  let level = 1;
  let xpForCurrent = 0;
  let xpForNext = 100;

  while (totalXp >= xpForNext) {
    level++;
    xpForCurrent = xpForNext;
    xpForNext = Math.floor(xpForCurrent * 1.5) + 100;
  }

  return { level, xpForCurrent, xpForNext };
}

export function getXpProgress(totalXp: number): number {
  const { xpForCurrent, xpForNext } = calculateLevel(totalXp);
  if (xpForNext === 0) return 100;
  return Math.min(100, Math.round(((totalXp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function getRankSuffix(rank: number): string {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
}

export function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-500';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-amber-600';
  return 'text-neutral-500';
}

export function mapCertificateRow(row: Record<string, unknown>): Certificate {
  return {
    id: String(row.id),
    certificateNumber: String(row.certificate_number),
    verificationCode: String(row.verification_code),
    studentId: String(row.student_id),
    batchId: (row.batch_id as string | null) ?? null,
    templateId: (row.template_id as string | null) ?? null,
    type: row.type as CertificateType,
    status: row.status as CertificateStatus,
    studentName: String(row.student_name),
    batchName: (row.batch_name as string | null) ?? null,
    courseName: (row.course_name as string | null) ?? null,
    instructorName: (row.instructor_name as string | null) ?? null,
    completionDate: String(row.completion_date),
    expiryDate: (row.expiry_date as string | null) ?? null,
    issuedBy: (row.issued_by as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapTemplateRow(row: Record<string, unknown>): CertificateTemplate {
  return {
    id: String(row.id),
    name: String(row.name),
    description: (row.description as string | null) ?? null,
    backgroundUrl: (row.background_url as string | null) ?? null,
    logoUrl: (row.logo_url as string | null) ?? null,
    signatureUrl: (row.signature_url as string | null) ?? null,
    stampUrl: (row.stamp_url as string | null) ?? null,
    templateConfig: (row.template_config as Record<string, unknown>) ?? {},
    isActive: Boolean(row.is_active),
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapAchievementRow(row: Record<string, unknown>): Achievement {
  return {
    id: String(row.id),
    name: String(row.name),
    description: (row.description as string | null) ?? null,
    icon: (row.icon as string | null) ?? null,
    category: row.category as AchievementCategory,
    criteria: (row.criteria as Record<string, unknown>) ?? {},
    xpReward: Number(row.xp_reward ?? 0),
    pointsReward: Number(row.points_reward ?? 0),
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapBadgeRow(row: Record<string, unknown>): Badge {
  return {
    id: String(row.id),
    name: String(row.name),
    description: (row.description as string | null) ?? null,
    icon: (row.icon as string | null) ?? null,
    color: (row.color as string | null) ?? null,
    tier: row.tier as BadgeTier,
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapMissionRow(row: Record<string, unknown>): Mission {
  return {
    id: String(row.id),
    name: String(row.name),
    description: (row.description as string | null) ?? null,
    type: row.type as MissionType,
    action: row.action as MissionAction,
    targetCount: Number(row.target_count ?? 1),
    xpReward: Number(row.xp_reward ?? 0),
    pointsReward: Number(row.points_reward ?? 0),
    isActive: Boolean(row.is_active),
    startDate: (row.start_date as string | null) ?? null,
    endDate: (row.end_date as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapStudentMissionRow(row: Record<string, unknown>): StudentMission {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    missionId: String(row.mission_id),
    progress: Number(row.progress ?? 0),
    isCompleted: Boolean(row.is_completed),
    isRewardClaimed: Boolean(row.is_reward_claimed),
    completedAt: (row.completed_at as string | null) ?? null,
    claimedAt: (row.claimed_at as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapRewardPointRow(row: Record<string, unknown>): RewardPoint {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    type: row.type as RewardType,
    points: Number(row.points ?? 0),
    balance: Number(row.balance ?? 0),
    description: (row.description as string | null) ?? null,
    referenceId: (row.reference_id as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export function mapLeaderboardRow(row: Record<string, unknown>): LeaderboardEntry {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: String(row.student_name),
    avatarUrl: (row.avatar_url as string | null) ?? null,
    category: row.category as LeaderboardCategory,
    period: row.period as LeaderboardPeriod,
    batchId: (row.batch_id as string | null) ?? null,
    score: Number(row.score ?? 0),
    rank: Number(row.rank ?? 0),
    periodStart: (row.period_start as string | null) ?? null,
    periodEnd: (row.period_end as string | null) ?? null,
    updatedAt: String(row.updated_at),
  };
}

export function mapStudentXpRow(row: Record<string, unknown>): StudentXp {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    totalXp: Number(row.total_xp ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapStudentLevelRow(row: Record<string, unknown>): StudentLevel {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    currentLevel: Number(row.current_level ?? 1),
    xpForCurrentLevel: Number(row.xp_for_current_level ?? 0),
    xpForNextLevel: Number(row.xp_for_next_level ?? 100),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapStudyStreakRow(row: Record<string, unknown>): StudyStreak {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    currentStreak: Number(row.current_streak ?? 0),
    longestStreak: Number(row.longest_streak ?? 0),
    lastStudyDate: (row.last_study_date as string | null) ?? null,
    freezeDays: Number(row.freeze_days ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}