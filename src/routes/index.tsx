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
    { path: 'subjects', element: withSuspense(<AdminSubjectListPage />) },
    { path: 'subjects/new', element: withSuspense(<AdminSubjectFormPage mode="create" />) },
    { path: 'subjects/:id', element: withSuspense(<AdminSubjectDetailsPage />) },
    { path: 'subjects/:id/edit', element: withSuspense(<AdminSubjectFormPage mode="edit" />) },
    { path: 'chapters', element: withSuspense(<AdminChapterListPage />) },
    { path: 'chapters/new', element: withSuspense(<AdminChapterFormPage mode="create" />) },
    { path: 'chapters/:id', element: withSuspense(<AdminChapterDetailsPage />) },
    { path: 'chapters/:id/edit', element: withSuspense(<AdminChapterFormPage mode="edit" />) },
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
export { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from '@/pages/auth';
