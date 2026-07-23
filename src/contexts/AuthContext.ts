import { createContext, useContext } from 'react';
import type { AuthUser, AuthSession } from '@/types/auth';
import type { UserRole } from '@/types/auth';

export interface AuthContextValue {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  authenticated: boolean;
  role: UserRole | undefined;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, metadata?: Record<string, unknown> | undefined) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refresh: () => Promise<{ error: string | null }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
