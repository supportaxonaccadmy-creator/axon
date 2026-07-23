import { getSupabaseClient } from '@/lib/supabase';
import type { AuthSession, AuthUser, AuthResult } from '@/types/auth';
import type { User, Session } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
    userMetadata: user.user_metadata ?? {},
    appMetadata: user.app_metadata ?? {},
  };
}

function mapSession(session: Session): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? 0,
    expiresInSeconds: session.expires_in,
    user: mapUser(session.user),
  };
}

export async function getSession(): Promise<{ session: AuthSession | null; error: string | null }> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) {
    logger.error('getSession error', { error: error.message });
    return { session: null, error: error.message };
  }
  if (!data.session) return { session: null, error: null };
  return { session: mapSession(data.session), error: null };
}

export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) {
    logger.error('getCurrentUser error', { error: error.message });
    return { user: null, error: error.message };
  }
  if (!data.user) return { user: null, error: null };
  return { user: mapUser(data.user), error: null };
}

export async function refreshSession(): Promise<{ session: AuthSession | null; error: string | null }> {
  const { data, error } = await getSupabaseClient().auth.refreshSession();
  if (error) {
    logger.error('refreshSession error', { error: error.message });
    return { session: null, error: error.message };
  }
  if (!data.session) return { session: null, error: null };
  return { session: mapSession(data.session), error: null };
}

export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) {
    logger.error('signOut error', { error: error.message });
    return { error: error.message };
  }
  return { error: null };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) {
    logger.error('signIn error', { error: error.message });
    return { success: false, user: null, session: null, error: error.message };
  }
  return {
    success: true,
    user: data.user ? mapUser(data.user) : null,
    session: data.session ? mapSession(data.session) : null,
    error: null,
  };
}

export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown> | undefined,
): Promise<AuthResult> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    ...(metadata ? { options: { data: metadata } } : {}),
  });
  if (error) {
    logger.error('signUp error', { error: error.message });
    return { success: false, user: null, session: null, error: error.message };
  }
  return {
    success: true,
    user: data.user ? mapUser(data.user) : null,
    session: data.session ? mapSession(data.session) : null,
    error: null,
  };
}

export function onAuthStateChange(
  callback: (event: string, session: AuthSession | null) => void,
): { unsubscribe: () => void } {
  const { data } = getSupabaseClient().auth.onAuthStateChange((event, session) => {
    (async () => {
      const mappedSession = session ? mapSession(session) : null;
      callback(event, mappedSession);
    })();
  });

  return {
    unsubscribe: () => data.subscription.unsubscribe(),
  };
}
