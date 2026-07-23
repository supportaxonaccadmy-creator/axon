import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/auth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (authenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function RoleGuard({ children, allowedRoles }: { children: ReactNode; allowedRoles: UserRole[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
}
