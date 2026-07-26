export { BaseService } from './base/BaseService';
export { ApiService } from './api/ApiService';
export { StorageService, storageService } from './storage/StorageService';
export { LoggerServiceWrapper, loggerService } from './logger/LoggerService';
export {
  getProfile,
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  refreshProfile,
} from './profile';
export {
  hasPermission,
  hasAny,
  hasAll,
  canAccessRoute,
  canAccessFeatureByKey,
  getPermissions,
} from './authorization';
export {
  fetchDashboardStats,
  fetchDashboardActivity,
  fetchDashboardQuickActions,
  fetchSystemStatus,
  fetchDashboardSummary,
} from './dashboard';
export { batchService, subjectService, chapterService, classService, videoService, pdfService, mcqService, attachmentService, pricingService, purchaseService, enrollmentService, hierarchyService, searchService, statisticsService, validationService, transactionService, BaseLmsService, enhancedSearchService, performanceOptimizer, createLazyLoader, integrityEngine, hierarchyValidator, relationshipValidator, enrollmentValidator, purchaseValidator, pricingValidator, duplicateDetector, missingReferenceDetector, brokenHierarchyDetector } from './lms';
export type { BatchListOptions, SubjectListOptions, ChapterListOptions, ClassListOptions, VideoListOptions, PdfListOptions, McqSetListOptions, AttachmentListOptions, PricingListOptions, PurchaseListOptions, EnrollmentListOptions, LmsServiceResult, LmsListResult, LmsFilter, LmsListOptions, HierarchyNode, BreadcrumbItem, SearchResultItem, SearchOptions, BatchStatistics, GlobalStatistics, ContentStatusCounts, LmsValidationResult, CreateHierarchyInput, CreateHierarchyResult, DeleteHierarchyResult, PublishHierarchyResult, ArchiveHierarchyResult, EnhancedSearchResultItem, EnhancedSearchOptions, IntegrityIssue, IntegrityReport } from './lms';
