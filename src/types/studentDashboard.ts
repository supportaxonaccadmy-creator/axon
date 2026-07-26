export interface StudentBatchInfo {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  thumbnailUrl: string | null;
  enrolledAt: string;
  expiresAt: string | null;
  progress: number;
  totalClasses: number;
  completedClasses: number;
}

export interface StudentContinueLearning {
  id: string;
  batchId: string;
  batchTitle: string;
  classId: string;
  classTitle: string;
  classSlug: string;
  type: 'video' | 'pdf' | 'mcq';
  thumbnailUrl: string | null;
  progress: number;
  lastAccessedAt: string;
  duration: string | null;
}

export interface StudentRecentClass {
  id: string;
  batchId: string;
  batchTitle: string;
  classId: string;
  classTitle: string;
  type: 'video' | 'pdf' | 'mcq';
  accessedAt: string;
  duration: string | null;
}

export interface StudentLiveClass {
  id: string;
  batchId: string;
  batchTitle: string;
  title: string;
  scheduledAt: string;
  status: 'upcoming' | 'live' | 'completed';
  meetingUrl: string | null;
}

export interface StudentAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  createdAt: string;
  read: boolean;
}

export interface StudentProgress {
  purchasedBatches: number;
  completedClasses: number;
  totalClasses: number;
  completionPercent: number;
  mcqAttempted: number;
  averageScore: number;
  studyTimeHours: number;
  certificates: number;
}

export interface StudentQuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  href: string;
  variant: 'primary' | 'outline';
}

export interface StudentDashboardSummary {
  batches: StudentBatchInfo[];
  continueLearning: StudentContinueLearning[];
  recentClasses: StudentRecentClass[];
  upcomingLiveClasses: StudentLiveClass[];
  announcements: StudentAnnouncement[];
  progress: StudentProgress;
  quickActions: StudentQuickAction[];
  lastRefreshed: string;
}
