import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { BlankLayout } from '@/layouts/BlankLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PageLoader } from '@/components/feedback/Loaders';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { GuestRoute, ProtectedRoute } from '@/routes/guards';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
);
const AccessDeniedPage = lazy(() =>
  import('@/pages/AccessDeniedPage').then((m) => ({ default: m.AccessDeniedPage })),
);
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ProtectedRoute>{withSuspense(<HomePage />)}</ProtectedRoute>,
      },
      {
        path: ROUTES.PROFILE,
        element: <ProtectedRoute>{withSuspense(<ProfilePage />)}</ProtectedRoute>,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <GuestRoute>{withSuspense(<LoginPage />)}</GuestRoute>,
      },
      {
        path: ROUTES.REGISTER,
        element: <GuestRoute>{withSuspense(<RegisterPage />)}</GuestRoute>,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <GuestRoute>{withSuspense(<ForgotPasswordPage />)}</GuestRoute>,
      },
      {
        path: ROUTES.RESET_PASSWORD,
        element: <GuestRoute>{withSuspense(<ResetPasswordPage />)}</GuestRoute>,
      },
    ],
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <BlankLayout />,
    children: [{ index: true, element: withSuspense(<UnauthorizedPage />) }],
  },
  {
    path: ROUTES.ACCESS_DENIED,
    element: <BlankLayout />,
    children: [{ index: true, element: withSuspense(<AccessDeniedPage />) }],
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <BlankLayout />,
    children: [{ index: true, element: <NotFoundPage /> }],
  },
];

export const router = createBrowserRouter(routes);
