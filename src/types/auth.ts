export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'MFA_CHALLENGE_VERIFIED'
  | 'INITIAL_SESSION';

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string | undefined;
  lastSignInAt: string | undefined;
  userMetadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresInSeconds: number | undefined;
  user: AuthUser;
}

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  metadata?: Record<string, unknown> | undefined;
}

export interface AuthResult {
  success: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
}

export interface AuthStateChangeCallback {
  (event: AuthEvent, session: AuthSession | null): void;
}
