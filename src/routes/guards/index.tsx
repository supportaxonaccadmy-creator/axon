import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthorizationContext } from '@/contexts/AuthorizationContext';
import type { Permission, Role } from '@/types/authorization';
import { AccessDeniedCard } from '@/components/authorization/AccessDeniedCard';
import { ROUTES } from '@/constants/routes';

function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
    </div>
  );
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!authenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (authenticated) return <Navigate to={ROUTES.HOME} state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading: authLoading } = useAuth();
  const { role, loading: authzLoading } = useAuthorizationContext();
  const location = useLocation();

  if (authLoading || authzLoading) return <LoadingSpinner />;
  if (!authenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  if (role !== 'admin') return <AccessDeniedCard />;
  return <>{children}</>;
}

export function StudentRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading: authLoading } = useAuth();
  const { role, loading: authzLoading } = useAuthorizationContext();
  const location = useLocation();

  if (authLoading || authzLoading) return <LoadingSpinner />;
  if (!authenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  if (role !== 'student') return <AccessDeniedCard />;
  return <>{children}</>;
}

export function PermissionRoute({
  children,
  permissions,
  requireAll = false,
}: {
  children: ReactNode;
  permissions: Permission[];
  requireAll?: boolean | undefined;
}) {
  const { authenticated, loading: authLoading } = useAuth();
  const { hasAny, hasAll, loading: authzLoading } = useAuthorizationContext();
  const location = useLocation();

  if (authLoading || authzLoading) return <LoadingSpinner />;
  if (!authenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;

  const allowed = requireAll ? hasAll(permissions) : hasAny(permissions);
  if (!allowed) return <AccessDeniedCard />;
  return <>{children}</>;
}

export function RoleRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles: Role[];
}) {
  const { authenticated, loading: authLoading } = useAuth();
  const { role, loading: authzLoading } = useAuthorizationContext();
  const location = useLocation();

  if (authLoading || authzLoading) return <LoadingSpinner />;
  if (!authenticated) return <Navigate to={ROUTES.LOGIN} state={{ from: location.pathname }} replace />;
  if (!role || !roles.includes(role)) return <AccessDeniedCard />;
  return <>{children}</>;
}

export function FeatureGuard({
  children,
  featureKey,
}: {
  children: ReactNode;
  featureKey: string;
}) {
  const { canAccessFeature, loading } = useAuthorizationContext();

  if (loading) return <LoadingSpinner />;
  if (!canAccessFeature(featureKey)) return <AccessDeniedCard />;
  return <>{children}</>;
}
