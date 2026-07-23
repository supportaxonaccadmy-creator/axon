import type { SupabaseErrorDetail } from '@/types/supabase';
import { AUTH_ERRORS } from '@/constants/auth';

export function formatSupabaseError(error: {
  message: string;
  code?: string | undefined;
  details?: unknown;
  hint?: string | undefined;
}): SupabaseErrorDetail {
  return {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
}

export function isAuthError(error: { code?: string | undefined; message: string }): boolean {
  if (!error.code) return false;
  const authErrorCodes = [
    'auth_invalid_credentials',
    'auth_session_expired',
    'auth_user_not_found',
    'auth_invalid_token',
    'PGRST301',
    'invalid_credentials',
  ];
  return authErrorCodes.includes(error.code);
}

export function getAuthErrorMessage(error: { code?: string | undefined; message: string }): string {
  if (!error.code) return error.message;

  switch (error.code) {
    case 'invalid_credentials':
      return AUTH_ERRORS.INVALID_CREDENTIALS;
    case 'auth_user_not_found':
      return AUTH_ERRORS.USER_NOT_FOUND;
    case 'auth_session_expired':
      return AUTH_ERRORS.SESSION_EXPIRED;
    default:
      return error.message;
  }
}
