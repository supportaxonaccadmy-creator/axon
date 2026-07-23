import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/contexts/AuthContext';
import { getSession, getCurrentUser, signIn, signUp, signOut, refreshSession, onAuthStateChange } from '@/lib/auth/authService';
import type { AuthUser, AuthSession } from '@/types/auth';
import { logger } from '@/lib/logger';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const { session: restoredSession, error } = await getSession();
        if (!mounted) return;

        if (error) {
          logger.warn('Session restore error', { error });
        }

        if (restoredSession) {
          setSession(restoredSession);
          const { user: restoredUser } = await getCurrentUser();
          if (mounted && restoredUser) {
            setUser(restoredUser);
          }
        }
      } catch (err) {
        logger.error('Failed to restore session', { error: err instanceof Error ? err.message : String(err) });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    restoreSession();

    const { unsubscribe } = onAuthStateChange((event, mappedSession) => {
      if (!mounted) return;

      logger.info('Auth state changed', { event });

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
        setSession(mappedSession);
        if (mappedSession) {
          setUser(mappedSession.user);
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    setLoading(true);
    const result = await signIn(email, password);
    if (result.success && result.session) {
      setSession(result.session);
      if (result.user) setUser(result.user);
    }
    setLoading(false);
    return { error: result.error };
  }, []);

  const register = useCallback(async (email: string, password: string, metadata?: Record<string, unknown> | undefined): Promise<{ error: string | null }> => {
    setLoading(true);
    const result = await signUp(email, password, metadata);
    if (result.success && result.session) {
      setSession(result.session);
      if (result.user) setUser(result.user);
    }
    setLoading(false);
    return { error: result.error };
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    await signOut();
    setUser(null);
    setSession(null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async (): Promise<{ error: string | null }> => {
    const { session: refreshedSession, error } = await refreshSession();
    if (refreshedSession) {
      setSession(refreshedSession);
      setUser(refreshedSession.user);
    }
    return { error };
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    authenticated: !!session && !!user,
    role: user?.role,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
