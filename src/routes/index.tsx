import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { MainLayout } from '@/layouts/MainLayout';
import { BlankLayout } from '@/layouts/BlankLayout';
import { PageLoader } from '@/components/feedback/Loaders';
import { NotFoundPage } from '@/pages/NotFoundPage';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
);
const AccessDeniedPage = lazy(() =>
  import('@/pages/AccessDeniedPage').then((m) => ({ default: m.AccessDeniedPage })),
);

const withSuspense = (element: React.ReactNode) => <Suspense fallback={<PageLoader />}>{element}</Suspense>;

export const routes: RouteObject[] = [
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
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
