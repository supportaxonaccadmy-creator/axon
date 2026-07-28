import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { StudentLayout } from '@/layouts/StudentLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PageLoader } from '@/components/feedback/Loaders';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { GuestRoute, ProtectedRoute, AdminRoute, StudentRoute } from '@/routes/guards';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })));
const AccessDeniedPage = lazy(() => import('@/pages/AccessDeniedPage').then((m) => ({ default: m.AccessDeniedPage })));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage').then((m) => ({ default: m.ForbiddenPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const StudentDashboardPage = lazy(() => import('@/pages/student/DashboardPage').then((m) => ({ default: m.StudentDashboardPage })));
const BatchListPage = lazy(() => import('@/pages/student/BatchListPage').then((m) => ({ default: m.BatchListPage })));
const BatchDetailsPage = lazy(() => import('@/pages/student/BatchDetailsPage').then((m) => ({ default: m.BatchDetailsPage })));
const SubjectPage = lazy(() => import('@/pages/student/SubjectPage').then((m) => ({ default: m.SubjectPage })));
const ChapterPage = lazy(() => import('@/pages/student/ChapterPage').then((m) => ({ default: m.ChapterPage })));
const ClassPage = lazy(() => import('@/pages/student/ClassPage').then((m) => ({ default: m.ClassPage })));
const McqDashboardPage = lazy(() => import('@/pages/student/McqDashboardPage').then((m) => ({ default: m.McqDashboardPage })));
const McqPlayerPage = lazy(() => import('@/pages/student/McqPlayerPage').then((m) => ({ default: m.McqPlayerPage })));
const McqResultPage = lazy(() => import('@/pages/student/McqResultPage').then((m) => ({ default: m.McqResultPage })));
const McqReviewPage = lazy(() => import('@/pages/student/McqReviewPage').then((m) => ({ default: m.McqReviewPage })));
const AdminSubjectListPage = lazy(() => import('@/pages/admin/SubjectListPage').then((m) => ({ default: m.SubjectListPage })));
const AdminSubjectDetailsPage = lazy(() => import('@/pages/admin/SubjectDetailsPage').then((m) => ({ default: m.SubjectDetailsPage })));
const AdminSubjectFormPage = lazy(() => import('@/pages/admin/SubjectFormPage').then((m) => ({ default: m.SubjectFormPage })));
const AdminChapterListPage = lazy(() => import('@/pages/admin/ChapterListPage').then((m) => ({ default: m.ChapterListPage })));
const AdminChapterDetailsPage = lazy(() => import('@/pages/admin/ChapterDetailsPage').then((m) => ({ default: m.ChapterDetailsPage })));
const AdminChapterFormPage = lazy(() => import('@/pages/admin/ChapterFormPage').then((m) => ({ default: m.ChapterFormPage })));
const AdminBatchListPage = lazy(() => import('@/pages/admin/BatchListPage').then((m) => ({ default: m.BatchListPage })));
const AdminBatchDetailsPage = lazy(() => import('@/pages/admin/BatchDetailsPage').then((m) => ({ default: m.BatchDetailsPage })));
const AdminBatchFormPage = lazy(() => import('@/pages/admin/BatchFormPage').then((m) => ({ default: m.BatchFormPage })));
const AdminClassListPage = lazy(() => import('@/pages/admin/ClassListPage').then((m) => ({ default: m.ClassListPage })));
const AdminClassDetailsPage = lazy(() => import('@/pages/admin/ClassDetailsPage').then((m) => ({ default: m.ClassDetailsPage })));
const AdminClassFormPage = lazy(() => import('@/pages/admin/ClassFormPage').then((m) => ({ default: m.ClassFormPage })));
const AdminVideoListPage = lazy(() => import('@/pages/admin/VideoListPage').then((m) => ({ default: m.VideoListPage })));
const AdminVideoDetailsPage = lazy(() => import('@/pages/admin/VideoDetailsPage').then((m) => ({ default: m.VideoDetailsPage })));
const AdminVideoFormPage = lazy(() => import('@/pages/admin/VideoFormPage').then((m) => ({ default: m.VideoFormPage })));
const AdminPdfListPage = lazy(() => import('@/pages/admin/PdfListPage').then((m) => ({ default: m.PdfListPage })));
const AdminPdfDetailsPage = lazy(() => import('@/pages/admin/PdfDetailsPage').then((m) => ({ default: m.PdfDetailsPage })));
const AdminPdfFormPage = lazy(() => import('@/pages/admin/PdfFormPage').then((m) => ({ default: m.PdfFormPage })));
const AdminAttachmentListPage = lazy(() => import('@/pages/admin/AttachmentListPage').then((m) => ({ default: m.AttachmentListPage })));
const AdminAttachmentDetailsPage = lazy(() => import('@/pages/admin/AttachmentDetailsPage').then((m) => ({ default: m.AttachmentDetailsPage })));
const AdminAttachmentFormPage = lazy(() => import('@/pages/admin/AttachmentFormPage').then((m) => ({ default: m.AttachmentFormPage })));
const AdminMcqListPage = lazy(() => import('@/pages/admin/McqListPage').then((m) => ({ default: m.McqListPage })));
const AdminMcqDetailsPage = lazy(() => import('@/pages/admin/McqDetailsPage').then((m) => ({ default: m.McqDetailsPage })));
const AdminMcqFormPage = lazy(() => import('@/pages/admin/McqFormPage').then((m) => ({ default: m.McqFormPage })));
const AdminMcqQuestionFormPage = lazy(() => import('@/pages/admin/McqQuestionFormPage').then((m) => ({ default: m.McqQuestionFormPage })));
const AdminStudentListPage = lazy(() => import('@/pages/admin/StudentListPage').then((m) => ({ default: m.StudentListPage })));
const AdminStudentDetailsPage = lazy(() => import('@/pages/admin/StudentDetailsPage').then((m) => ({ default: m.StudentDetailsPage })));
const AdminStudentFormPage = lazy(() => import('@/pages/admin/StudentFormPage').then((m) => ({ default: m.StudentFormPage })));
const AdminEnrollmentListPage = lazy(() => import('@/pages/admin/EnrollmentListPage').then((m) => ({ default: m.EnrollmentListPage })));
const AdminEnrollmentDetailsPage = lazy(() => import('@/pages/admin/EnrollmentDetailsPage').then((m) => ({ default: m.EnrollmentDetailsPage })));
const AdminPurchaseListPage = lazy(() => import('@/pages/admin/PurchaseListPage').then((m) => ({ default: m.PurchaseListPage })));
const AdminPurchaseDetailsPage = lazy(() => import('@/pages/admin/PurchaseDetailsPage').then((m) => ({ default: m.PurchaseDetailsPage })));
const AdminReportsPage = lazy(() => import('@/pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AdminSettingsDashboardPage = lazy(() => import('@/pages/admin/settings/SettingsDashboardPage').then((m) => ({ default: m.SettingsDashboardPage })));
const AdminRoleListPage = lazy(() => import('@/pages/admin/settings/RoleListPage').then((m) => ({ default: m.RoleListPage })));
const AdminRoleFormPage = lazy(() => import('@/pages/admin/settings/RoleFormPage').then((m) => ({ default: m.RoleFormPage })));
const AdminAdminUserListPage = lazy(() => import('@/pages/admin/settings/AdminUserListPage').then((m) => ({ default: m.AdminUserListPage })));
const AdminAdminUserFormPage = lazy(() => import('@/pages/admin/settings/AdminUserFormPage').then((m) => ({ default: m.AdminUserFormPage })));
const AdminWebsiteSettingsPage = lazy(() => import('@/pages/admin/settings/WebsiteSettingsPage').then((m) => ({ default: m.WebsiteSettingsPage })));
const AdminSeoSettingsPage = lazy(() => import('@/pages/admin/settings/SeoSettingsPage').then((m) => ({ default: m.SeoSettingsPage })));
const AdminEmailSettingsPage = lazy(() => import('@/pages/admin/settings/EmailSettingsPage').then((m) => ({ default: m.EmailSettingsPage })));
const AdminPaymentSettingsPage = lazy(() => import('@/pages/admin/settings/PaymentSettingsPage').then((m) => ({ default: m.PaymentSettingsPage })));
const AdminStorageSettingsPage = lazy(() => import('@/pages/admin/settings/StorageSettingsPage').then((m) => ({ default: m.StorageSettingsPage })));
const AdminNotificationSettingsPage = lazy(() => import('@/pages/admin/settings/NotificationSettingsPage').then((m) => ({ default: m.NotificationSettingsPage })));
const AdminSecuritySettingsPage = lazy(() => import('@/pages/admin/settings/SecuritySettingsPage').then((m) => ({ default: m.SecuritySettingsPage })));
const AdminSystemSettingsPage = lazy(() => import('@/pages/admin/settings/SystemSettingsPage').then((m) => ({ default: m.SystemSettingsPage })));
const AdminBackupPage = lazy(() => import('@/pages/admin/settings/BackupPage').then((m) => ({ default: m.BackupPage })));
const AdminAuditLogPage = lazy(() => import('@/pages/admin/settings/AuditLogPage').then((m) => ({ default: m.AuditLogPage })));
const AdminSystemHealthPage = lazy(() => import('@/pages/admin/settings/SystemHealthPage').then((m) => ({ default: m.SystemHealthPage })));
const StudentCheckoutPage = lazy(() => import('@/pages/student/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const StudentPaymentSuccessPage = lazy(() => import('@/pages/student/PaymentSuccessPage').then((m) => ({ default: m.PaymentSuccessPage })));
const StudentPaymentFailurePage = lazy(() => import('@/pages/student/PaymentFailurePage').then((m) => ({ default: m.PaymentFailurePage })));
const StudentPurchaseHistoryPage = lazy(() => import('@/pages/student/PurchaseHistoryPage').then((m) => ({ default: m.PurchaseHistoryPage })));
const StudentInvoicePage = lazy(() => import('@/pages/student/InvoicePage').then((m) => ({ default: m.InvoicePage })));
const AdminStorageDashboardPage = lazy(() => import('@/pages/admin/storage/StorageDashboardPage').then((m) => ({ default: m.StorageDashboardPage })));
const AdminStorageUploadPage = lazy(() => import('@/pages/admin/storage/StorageUploadPage').then((m) => ({ default: m.StorageUploadPage })));
const AdminStorageDetailsPage = lazy(() => import('@/pages/admin/storage/StorageDetailsPage').then((m) => ({ default: m.StorageDetailsPage })));

function withSuspense(element: React.ReactNode) { return <Suspense fallback={<PageLoader />}>{element}</Suspense>; }

export const routes: RouteObject[] = [
  { path: ROUTES.HOME, element: <MainLayout />, children: [
    { index: true, element: withSuspense(<HomePage />) },
    { path: 'unauthorized', element: withSuspense(<UnauthorizedPage />) },
    { path: 'access-denied', element: withSuspense(<AccessDeniedPage />) },
    { path: 'forbidden', element: withSuspense(<ForbiddenPage />) },
  ]},
  { path: '/login', element: (<GuestRoute><AuthLayout /></GuestRoute>), children: [{ index: true, element: withSuspense(<LoginPage />) }] },
  { path: '/register', element: (<GuestRoute><AuthLayout /></GuestRoute>), children: [{ index: true, element: withSuspense(<RegisterPage />) }] },
  { path: '/forgot-password', element: (<GuestRoute><AuthLayout /></GuestRoute>), children: [{ index: true, element: withSuspense(<ForgotPasswordPage />) }] },
  { path: '/reset-password', element: (<GuestRoute><AuthLayout /></GuestRoute>), children: [{ index: true, element: withSuspense(<ResetPasswordPage />) }] },
  { path: '/profile', element: (<ProtectedRoute><MainLayout /></ProtectedRoute>), children: [{ index: true, element: withSuspense(<ProfilePage />) }] },
  { path: ROUTES.ADMIN, element: (<AdminRoute><AdminLayout /></AdminRoute>), children: [
    { index: true, element: withSuspense(<DashboardPage />) },
    { path: 'batches', element: withSuspense(<AdminBatchListPage />) },
    { path: 'batches/new', element: withSuspense(<AdminBatchFormPage mode="create" />) },
    { path: 'batches/:id', element: withSuspense(<AdminBatchDetailsPage />) },
    { path: 'batches/:id/edit', element: withSuspense(<AdminBatchFormPage mode="edit" />) },
    { path: 'subjects', element: withSuspense(<AdminSubjectListPage />) },
    { path: 'subjects/new', element: withSuspense(<AdminSubjectFormPage mode="create" />) },
    { path: 'subjects/:id', element: withSuspense(<AdminSubjectDetailsPage />) },
    { path: 'subjects/:id/edit', element: withSuspense(<AdminSubjectFormPage mode="edit" />) },
    { path: 'chapters', element: withSuspense(<AdminChapterListPage />) },
    { path: 'chapters/new', element: withSuspense(<AdminChapterFormPage mode="create" />) },
    { path: 'chapters/:id', element: withSuspense(<AdminChapterDetailsPage />) },
    { path: 'chapters/:id/edit', element: withSuspense(<AdminChapterFormPage mode="edit" />) },
    { path: 'classes', element: withSuspense(<AdminClassListPage />) },
    { path: 'classes/new', element: withSuspense(<AdminClassFormPage mode="create" />) },
    { path: 'classes/:id', element: withSuspense(<AdminClassDetailsPage />) },
    { path: 'classes/:id/edit', element: withSuspense(<AdminClassFormPage mode="edit" />) },
    { path: 'videos', element: withSuspense(<AdminVideoListPage />) },
    { path: 'videos/new', element: withSuspense(<AdminVideoFormPage mode="create" />) },
    { path: 'videos/:id', element: withSuspense(<AdminVideoDetailsPage />) },
    { path: 'videos/:id/edit', element: withSuspense(<AdminVideoFormPage mode="edit" />) },
    { path: 'pdfs', element: withSuspense(<AdminPdfListPage />) },
    { path: 'pdfs/new', element: withSuspense(<AdminPdfFormPage mode="create" />) },
    { path: 'pdfs/:id', element: withSuspense(<AdminPdfDetailsPage />) },
    { path: 'pdfs/:id/edit', element: withSuspense(<AdminPdfFormPage mode="edit" />) },
    { path: 'attachments', element: withSuspense(<AdminAttachmentListPage />) },
    { path: 'attachments/new', element: withSuspense(<AdminAttachmentFormPage mode="create" />) },
    { path: 'attachments/:id', element: withSuspense(<AdminAttachmentDetailsPage />) },
    { path: 'attachments/:id/edit', element: withSuspense(<AdminAttachmentFormPage mode="edit" />) },
    { path: 'mcq', element: withSuspense(<AdminMcqListPage />) },
    { path: 'mcq/new', element: withSuspense(<AdminMcqFormPage mode="create" />) },
    { path: 'mcq/:id', element: withSuspense(<AdminMcqDetailsPage />) },
    { path: 'mcq/:id/edit', element: withSuspense(<AdminMcqFormPage mode="edit" />) },
    { path: 'mcq/:id/questions/new', element: withSuspense(<AdminMcqQuestionFormPage mode="create" />) },
    { path: 'mcq/:id/questions/:questionId/edit', element: withSuspense(<AdminMcqQuestionFormPage mode="edit" />) },
    { path: 'students', element: withSuspense(<AdminStudentListPage />) },
    { path: 'students/new', element: withSuspense(<AdminStudentFormPage mode="create" />) },
    { path: 'students/:id', element: withSuspense(<AdminStudentDetailsPage />) },
    { path: 'students/:id/edit', element: withSuspense(<AdminStudentFormPage mode="edit" />) },
    { path: 'enrollments', element: withSuspense(<AdminEnrollmentListPage />) },
    { path: 'enrollments/:id', element: withSuspense(<AdminEnrollmentDetailsPage />) },
    { path: 'purchases', element: withSuspense(<AdminPurchaseListPage />) },
    { path: 'purchases/:id', element: withSuspense(<AdminPurchaseDetailsPage />) },
    { path: 'reports', element: withSuspense(<AdminReportsPage />) },
    { path: 'settings', element: withSuspense(<AdminSettingsDashboardPage />) },
    { path: 'settings/roles', element: withSuspense(<AdminRoleListPage />) },
    { path: 'settings/roles/new', element: withSuspense(<AdminRoleFormPage mode="create" />) },
    { path: 'settings/roles/:id/edit', element: withSuspense(<AdminRoleFormPage mode="edit" />) },
    { path: 'settings/admin-users', element: withSuspense(<AdminAdminUserListPage />) },
    { path: 'settings/admin-users/new', element: withSuspense(<AdminAdminUserFormPage mode="create" />) },
    { path: 'settings/admin-users/:id/edit', element: withSuspense(<AdminAdminUserFormPage mode="edit" />) },
    { path: 'settings/website', element: withSuspense(<AdminWebsiteSettingsPage />) },
    { path: 'settings/seo', element: withSuspense(<AdminSeoSettingsPage />) },
    { path: 'settings/email', element: withSuspense(<AdminEmailSettingsPage />) },
    { path: 'settings/payment', element: withSuspense(<AdminPaymentSettingsPage />) },
    { path: 'settings/storage', element: withSuspense(<AdminStorageSettingsPage />) },
    { path: 'settings/notifications', element: withSuspense(<AdminNotificationSettingsPage />) },
    { path: 'settings/security', element: withSuspense(<AdminSecuritySettingsPage />) },
    { path: 'settings/system', element: withSuspense(<AdminSystemSettingsPage />) },
    { path: 'settings/backups', element: withSuspense(<AdminBackupPage />) },
    { path: 'settings/audit', element: withSuspense(<AdminAuditLogPage />) },
    { path: 'settings/health', element: withSuspense(<AdminSystemHealthPage />) },
    { path: 'storage', element: withSuspense(<AdminStorageDashboardPage />) },
    { path: 'storage/upload', element: withSuspense(<AdminStorageUploadPage />) },
    { path: 'storage/:id', element: withSuspense(<AdminStorageDetailsPage />) },
  ] },
  { path: ROUTES.STUDENT, element: (<StudentRoute><StudentLayout /></StudentRoute>), children: [
    { index: true, element: withSuspense(<StudentDashboardPage />) },
    { path: 'batches', element: withSuspense(<BatchListPage />) },
    { path: 'batches/:slug', element: withSuspense(<BatchDetailsPage />) },
    { path: 'subjects/:slug', element: withSuspense(<SubjectPage />) },
    { path: 'chapters/:slug', element: withSuspense(<ChapterPage />) },
    { path: 'classes/:slug', element: withSuspense(<ClassPage />) },
    { path: 'mcq', element: withSuspense(<McqDashboardPage />) },
    { path: 'mcq/:setSlug', element: withSuspense(<McqPlayerPage />) },
    { path: 'mcq/:setSlug/result', element: withSuspense(<McqResultPage />) },
    { path: 'mcq/:setSlug/review', element: withSuspense(<McqReviewPage />) },
    { path: 'checkout/:batchSlug', element: withSuspense(<StudentCheckoutPage />) },
    { path: 'payment/success', element: withSuspense(<StudentPaymentSuccessPage />) },
    { path: 'payment/failure', element: withSuspense(<StudentPaymentFailurePage />) },
    { path: 'purchases', element: withSuspense(<StudentPurchaseHistoryPage />) },
    { path: 'invoice/:purchaseId', element: withSuspense(<StudentInvoicePage />) },
  ]},
  { path: '*', element: withSuspense(<NotFoundPage />) },
];

export const router = createBrowserRouter(routes);
export { HomePage } from '@/pages/HomePage';
export { UnauthorizedPage } from '@/pages/UnauthorizedPage';
export { AccessDeniedPage } from '@/pages/AccessDeniedPage';
export { ForbiddenPage } from '@/pages/ForbiddenPage';
export { NotFoundPage } from '@/pages/NotFoundPage';
export { ProfilePage } from '@/pages/ProfilePage';
export { DashboardPage } from '@/pages/admin/DashboardPage';
export { StudentDashboardPage } from '@/pages/student/DashboardPage';
export { BatchListPage } from '@/pages/student/BatchListPage';
export { BatchDetailsPage } from '@/pages/student/BatchDetailsPage';
export { SubjectPage } from '@/pages/student/SubjectPage';
export { ChapterPage } from '@/pages/student/ChapterPage';
export { ClassPage } from '@/pages/student/ClassPage';
export { McqDashboardPage } from '@/pages/student/McqDashboardPage';
export { McqPlayerPage } from '@/pages/student/McqPlayerPage';
export { McqResultPage } from '@/pages/student/McqResultPage';
export { McqReviewPage } from '@/pages/student/McqReviewPage';
export { SubjectListPage } from '@/pages/admin/SubjectListPage';
export { SubjectDetailsPage } from '@/pages/admin/SubjectDetailsPage';
export { SubjectFormPage } from '@/pages/admin/SubjectFormPage';
export { ChapterListPage } from '@/pages/admin/ChapterListPage';
export { ChapterDetailsPage } from '@/pages/admin/ChapterDetailsPage';
export { ChapterFormPage } from '@/pages/admin/ChapterFormPage';
export { BatchListPage as AdminBatchListPage } from '@/pages/admin/BatchListPage';
export { BatchDetailsPage as AdminBatchDetailsPage } from '@/pages/admin/BatchDetailsPage';
export { BatchFormPage as AdminBatchFormPage } from '@/pages/admin/BatchFormPage';
export { ClassListPage as AdminClassListPage } from '@/pages/admin/ClassListPage';
export { ClassDetailsPage as AdminClassDetailsPage } from '@/pages/admin/ClassDetailsPage';
export { ClassFormPage as AdminClassFormPage } from '@/pages/admin/ClassFormPage';
export { VideoListPage as AdminVideoListPage } from '@/pages/admin/VideoListPage';
export { VideoDetailsPage as AdminVideoDetailsPage } from '@/pages/admin/VideoDetailsPage';
export { VideoFormPage as AdminVideoFormPage } from '@/pages/admin/VideoFormPage';
export { PdfListPage as AdminPdfListPage } from '@/pages/admin/PdfListPage';
export { PdfDetailsPage as AdminPdfDetailsPage } from '@/pages/admin/PdfDetailsPage';
export { PdfFormPage as AdminPdfFormPage } from '@/pages/admin/PdfFormPage';
export { AttachmentListPage as AdminAttachmentListPage } from '@/pages/admin/AttachmentListPage';
export { AttachmentDetailsPage as AdminAttachmentDetailsPage } from '@/pages/admin/AttachmentDetailsPage';
export { AttachmentFormPage as AdminAttachmentFormPage } from '@/pages/admin/AttachmentFormPage';
export { McqListPage as AdminMcqListPage } from '@/pages/admin/McqListPage';
export { McqDetailsPage as AdminMcqDetailsPage } from '@/pages/admin/McqDetailsPage';
export { McqFormPage as AdminMcqFormPage } from '@/pages/admin/McqFormPage';
export { McqQuestionFormPage as AdminMcqQuestionFormPage } from '@/pages/admin/McqQuestionFormPage';
export { StudentListPage as AdminStudentListPage } from '@/pages/admin/StudentListPage';
export { StudentDetailsPage as AdminStudentDetailsPage } from '@/pages/admin/StudentDetailsPage';
export { StudentFormPage as AdminStudentFormPage } from '@/pages/admin/StudentFormPage';
export { EnrollmentListPage as AdminEnrollmentListPage } from '@/pages/admin/EnrollmentListPage';
export { EnrollmentDetailsPage as AdminEnrollmentDetailsPage } from '@/pages/admin/EnrollmentDetailsPage';
export { PurchaseListPage as AdminPurchaseListPage } from '@/pages/admin/PurchaseListPage';
export { PurchaseDetailsPage as AdminPurchaseDetailsPage } from '@/pages/admin/PurchaseDetailsPage';
export { ReportsPage as AdminReportsPage } from '@/pages/admin/ReportsPage';
export { SettingsDashboardPage as AdminSettingsDashboardPage } from '@/pages/admin/settings/SettingsDashboardPage';
export { RoleListPage as AdminRoleListPage } from '@/pages/admin/settings/RoleListPage';
export { RoleFormPage as AdminRoleFormPage } from '@/pages/admin/settings/RoleFormPage';
export { AdminUserListPage as AdminAdminUserListPage } from '@/pages/admin/settings/AdminUserListPage';
export { AdminUserFormPage as AdminAdminUserFormPage } from '@/pages/admin/settings/AdminUserFormPage';
export { WebsiteSettingsPage as AdminWebsiteSettingsPage } from '@/pages/admin/settings/WebsiteSettingsPage';
export { SeoSettingsPage as AdminSeoSettingsPage } from '@/pages/admin/settings/SeoSettingsPage';
export { EmailSettingsPage as AdminEmailSettingsPage } from '@/pages/admin/settings/EmailSettingsPage';
export { PaymentSettingsPage as AdminPaymentSettingsPage } from '@/pages/admin/settings/PaymentSettingsPage';
export { StorageSettingsPage as AdminStorageSettingsPage } from '@/pages/admin/settings/StorageSettingsPage';
export { NotificationSettingsPage as AdminNotificationSettingsPage } from '@/pages/admin/settings/NotificationSettingsPage';
export { SecuritySettingsPage as AdminSecuritySettingsPage } from '@/pages/admin/settings/SecuritySettingsPage';
export { SystemSettingsPage as AdminSystemSettingsPage } from '@/pages/admin/settings/SystemSettingsPage';
export { BackupPage as AdminBackupPage } from '@/pages/admin/settings/BackupPage';
export { AuditLogPage as AdminAuditLogPage } from '@/pages/admin/settings/AuditLogPage';
export { SystemHealthPage as AdminSystemHealthPage } from '@/pages/admin/settings/SystemHealthPage';
export { CheckoutPage as StudentCheckoutPage } from '@/pages/student/CheckoutPage';
export { PaymentSuccessPage as StudentPaymentSuccessPage } from '@/pages/student/PaymentSuccessPage';
export { PaymentFailurePage as StudentPaymentFailurePage } from '@/pages/student/PaymentFailurePage';
export { PurchaseHistoryPage as StudentPurchaseHistoryPage } from '@/pages/student/PurchaseHistoryPage';
export { InvoicePage as StudentInvoicePage } from '@/pages/student/InvoicePage';
export { StorageDashboardPage as AdminStorageDashboardPage } from '@/pages/admin/storage/StorageDashboardPage';
export { StorageUploadPage as AdminStorageUploadPage } from '@/pages/admin/storage/StorageUploadPage';
export { StorageDetailsPage as AdminStorageDetailsPage } from '@/pages/admin/storage/StorageDetailsPage';
export { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@/pages/auth';
