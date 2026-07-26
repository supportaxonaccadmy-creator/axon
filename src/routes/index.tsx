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

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

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
  { path: ROUTES.ADMIN, element: (<AdminRoute><AdminLayout /></AdminRoute>), children: [{ index: true, element: withSuspense(<DashboardPage />) }] },
  { path: ROUTES.STUDENT, element: (<StudentRoute><StudentLayout /></StudentRoute>), children: [
    { index: true, element: withSuspense(<StudentDashboardPage />) },
    { path: 'batches', element: withSuspense(<BatchListPage />) },
    { path: 'batches/:slug', element: withSuspense(<BatchDetailsPage />) },
    { path: 'subjects/:slug', element: withSuspense(<SubjectPage />) },
    { path: 'chapters/:slug', element: withSuspense(<ChapterPage />) },
    { path: 'classes/:slug', element: withSuspense(<ClassPage />) },
  ]},
  { path: '*', element: withSuspense(<NotFoundPage />) },
];

export const router = createBrowserRouter(routes);
export { HomePage } from './HomePage';
export { UnauthorizedPage } from './UnauthorizedPage';
export { AccessDeniedPage } from './AccessDeniedPage';
export { ForbiddenPage } from './ForbiddenPage';
export { NotFoundPage } from './NotFoundPage';
export { ProfilePage } from './ProfilePage';
export { DashboardPage } from './admin/DashboardPage';
export { StudentDashboardPage } from './student/DashboardPage';
export { BatchListPage } from './student/BatchListPage';
export { BatchDetailsPage } from './student/BatchDetailsPage';
export { SubjectPage } from './student/SubjectPage';
export { ChapterPage } from './student/ChapterPage';
export { ClassPage } from './student/ClassPage';
export { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './auth';
