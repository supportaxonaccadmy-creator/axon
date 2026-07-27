import type { DashboardStat } from './dashboard';

export interface DashboardStats {
  totalUsers: DashboardStat;
  activeStudents: DashboardStat;
  totalCourses: DashboardStat;
  completionRate: DashboardStat;
  revenueThisMonth: DashboardStat;
  pendingAssessments: DashboardStat;
  totalBatches?: DashboardStat | undefined;
  publishedBatches?: DashboardStat | undefined;
  subjects?: DashboardStat | undefined;
  chapters?: DashboardStat | undefined;
  classes?: DashboardStat | undefined;
  videos?: DashboardStat | undefined;
  pdfNotes?: DashboardStat | undefined;
  mcqSets?: DashboardStat | undefined;
  questions?: DashboardStat | undefined;
  enrollments?: DashboardStat | undefined;
  purchases?: DashboardStat | undefined;
  revenue?: DashboardStat | undefined;
}
