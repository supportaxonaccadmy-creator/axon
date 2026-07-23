import type { AuthSession } from '@/types/auth';
import { getSession, refreshSession } from '@/lib/auth/authService';
import { AUTH_CONFIG } from '@/constants/auth';

export function isSessionExpired(session: AuthSession): boolean {
  const expiresAtMs = session.expiresAt * 1000;
  return Date.now() >= expiresAtMs;
}

export function isSessionExpiringSoon(session: AuthSession, thresholdMs: number = AUTH_CONFIG.TOKEN_REFRESH_INTERVAL_MS): boolean {
  const expiresAtMs = session.expiresAt * 1000;
  return Date.now() >= expiresAtMs - thresholdMs;
}

export async function ensureValidSession(): Promise<{ session: AuthSession | null; error: string | null }> {
  const { session, error } = await getSession();
  if (error) return { session: null, error };
  if (!session) return { session: null, error: null };

  if (isSessionExpiringSoon(session)) {
    return refreshSession();
  }

  return { session, error: null };
}

export function getSessionAge(session: AuthSession): number {
  return Date.now() - (session.expiresAt * 1000 - (session.expiresInSeconds ?? 0) * 1000);
}
