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
export { batchService, subjectService, chapterService, classService, videoService, pdfService, mcqService, attachmentService } from './lms';
export type { BatchListOptions, SubjectListOptions, ChapterListOptions, ClassListOptions, VideoListOptions, PdfListOptions, McqSetListOptions, AttachmentListOptions } from './lms';
