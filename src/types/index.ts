export type {
  UUID, Timestamp, Nullable, Optional, DeepPartial, Primitive, ValueOf, Option, SelectOption, BreadcrumbItem, ToastOptions, ToastItem, PaginatedResponse, PaginationParams, PaginationMeta, SortParams, FilterParams,
} from './common';

export type { ApiErrorCode, ApiError, ApiErrorDetail, ApiRequestConfig, ApiResponse, ResponseMeta, ApiResult } from './api';
export { isApiError, isApiResponse } from './api';

export type { ErrorType, ErrorContext, SerializedError } from './errors';
export type { AppContextValue, ThemeContextValue, LoadingContextValue, SessionContextValue, ProviderState } from './providers';
export type { EnvironmentConfig, RuntimeConfig, LogLevel, FeatureFlags, VersionConfig, BuildConfig, AppConfig } from './configuration';
export type { UserRole, Permission, AppInfo, NavItem, FeatureConfig } from './application';
export type { Deferred, RetryOptions, ThrottleOptions, DebounceOptions, Result } from './utilities';
export { ok, err } from './utilities';
export type { ImportMetaEnv, ImportMeta } from './global';

export type { SupabaseClient, SupabaseErrorDetail, SupabaseClientConfig } from './supabase';
export type { AuthEvent, AuthUser, AuthSession, AuthState, SignInCredentials, SignUpData, AuthResult, AuthStateChangeCallback } from './auth';
export type { FilterOperator, FilterCondition, SortOrder, OrderCondition, QueryOptions, PaginatedResult, CountResult, TransactionCallback } from './database';
export type { UploadOptions, UploadResult, DownloadResult, FileMetadata, ListFilesOptions, ListFilesResult, StorageBucket, PublicUrlResult } from './storage';
export type { ProfileRole, ProfileStatus, Profile, ProfileUpdate, ProfileInsert, ProfileResponse, ProfileUpdateResponse, AvatarUploadResponse } from './profile';
export type { Role, Permission as AuthzPermission, PermissionGroup, PermissionCheck, AuthorizationState, FeatureFlag, FeatureFlagConfig, RoutePermission } from './authorization';
export type { DashboardStatTrend, DashboardActivityType, DashboardQuickActionVariant, DashboardWidgetSize, DashboardSystemStatusLevel, DashboardStat, DashboardStats, DashboardActivity, DashboardQuickAction, DashboardSystemStatus, DashboardSummary, DashboardCardConfig, DashboardWidget, DashboardUpcomingModule } from './dashboard';

export type { LmsStatus, Batch, BatchInsert, BatchUpdate, BatchWithCounts, BatchRow, Subject, SubjectInsert, SubjectUpdate, SubjectWithCounts, SubjectRow, Chapter, ChapterInsert, ChapterUpdate, ChapterWithCounts, ChapterRow, Class, ClassInsert, ClassUpdate, ClassRow, Video, VideoInsert, VideoUpdate, VideoRow, PdfNote, PdfNoteInsert, PdfNoteUpdate, PdfNoteRow, McqCorrectOption, McqSet, McqSetInsert, McqSetUpdate, McqSetRow, McqQuestion, McqQuestionInsert, McqQuestionUpdate, McqQuestionRow, McqSetWithQuestions, Attachment, AttachmentInsert, AttachmentUpdate, AttachmentRow, BatchPricing, BatchPricingInsert, BatchPricingUpdate, BatchPricingRow, PaymentStatus, PaymentGateway, Purchase, PurchaseInsert, PurchaseUpdate, PurchaseRow, EnrollmentType, EnrollmentStatus, Enrollment, EnrollmentInsert, EnrollmentUpdate, EnrollmentRow, EnrollmentWithDetails } from './lms';

export type { ValidationErrorCode, FieldError, ValidationReport, FieldType, FieldRule, ValidationSchema } from './validation';
export type { PaginationOptions, PaginationInfo, CursorOptions, CursorInfo, OffsetPagination, CursorPagination } from './pagination';
export type { SearchToken, SearchQuery, SearchResult, SearchHighlightConfig, SearchFilter } from './search';
export type { ResponsePayload, PayloadError, PayloadMeta, PaginatedResponsePayload, SuccessPayload, FailurePayload } from './response';
export type { FileType, FileValidationResult, FileMeta, StoragePathConfig } from './file';
export type { DateRange, DurationParts, RelativeDateResult, ExpiryResult } from './date';
