import type { GlobalStatistics, BatchStatistics } from '@/services/lms/statisticsService';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'all';

export interface ReportFilters {
  period: ReportPeriod;
  dateFrom: string;
  dateTo: string;
  batchId: string;
  subjectId: string;
  chapterId: string;
  classId: string;
  studentId: string;
  paymentStatus: string;
  enrollmentStatus: string;
}

export interface RevenueReportData {
  totalRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  trend: Array<{ label: string; value: number }>;
  batchWise: Array<{ batchId: string; batchTitle: string; revenue: number; count: number }>;
}

export interface EnrollmentReportData {
  totalEnrollments: number;
  activeCount: number;
  expiredCount: number;
  cancelledCount: number;
  trend: Array<{ label: string; value: number }>;
  batchWise: Array<{ batchId: string; batchTitle: string; count: number }>;
}

export interface StudentGrowthReportData {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  newThisMonth: number;
  trend: Array<{ label: string; value: number }>;
}

export interface ContentPerformanceReportData {
  batchCount: number;
  subjectCount: number;
  chapterCount: number;
  classCount: number;
  videoCount: number;
  pdfCount: number;
  mcqSetCount: number;
  mcqQuestionCount: number;
  distribution: Array<{ label: string; value: number; color: string }>;
}

export interface PurchaseReportData {
  totalPurchases: number;
  totalRevenue: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
  refundedCount: number;
  gatewayWise: Array<{ gateway: string; count: number; revenue: number }>;
  recent: Array<{ id: string; studentName: string; batchTitle: string; amount: number; status: string; date: string }>;
}

export interface McqAttemptReportData {
  totalMcqSets: number;
  totalQuestions: number;
  publishedSets: number;
  draftSets: number;
  topSets: Array<{ id: string; title: string; questionCount: number; status: string }>;
}

export interface ReportSummary {
  globalStats: GlobalStatistics | null;
  revenue: RevenueReportData | null;
  enrollments: EnrollmentReportData | null;
  studentGrowth: StudentGrowthReportData | null;
  contentPerformance: ContentPerformanceReportData | null;
  purchases: PurchaseReportData | null;
  mcqAttempts: McqAttemptReportData | null;
}

export type { BatchStatistics };
