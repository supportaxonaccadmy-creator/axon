import type { SecurityHeaders } from './security.types';

class SecurityService {
  private cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');

  getSecurityHeaders(): SecurityHeaders {
    return {
      'Content-Security-Policy': this.cspPolicy,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    };
  }

  applyMetaTags(): void {
    if (typeof document === 'undefined') return;
    const headers = this.getSecurityHeaders();
    const metaMap: Record<string, string> = {
      'Content-Security-Policy': headers['Content-Security-Policy'],
      'X-Frame-Options': headers['X-Frame-Options'],
      'X-Content-Type-Options': headers['X-Content-Type-Options'],
      'Referrer-Policy': headers['Referrer-Policy'],
    };
    for (const [key, value] of Object.entries(metaMap)) {
      const metaName = key.toLowerCase();
      let meta = document.querySelector(`meta[http-equiv="${metaName}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('http-equiv', metaName);
        document.head.appendChild(meta);
      }
      meta.content = value;
    }
  }

  sanitizeError(error: unknown): string {
    if (!error) return 'An unexpected error occurred.';
    if (typeof error === 'string') return this.sanitizeMessage(error);
    if (error instanceof Error) return this.sanitizeMessage(error.message);
    const obj = error as Record<string, unknown>;
    if (obj.message) return this.sanitizeMessage(String(obj.message));
    return 'An unexpected error occurred.';
  }

  private sanitizeMessage(message: string): string {
    const genericMessages: Record<string, string> = {
      'jwt expired': 'Your session has expired. Please sign in again.',
      'invalid claim': 'Your session is invalid. Please sign in again.',
      'User not found': 'Invalid credentials.',
      'Email not confirmed': 'Please verify your email address.',
    };
    for (const [key, value] of Object.entries(genericMessages)) {
      if (message.toLowerCase().includes(key.toLowerCase())) return value;
    }
    return message.replace(/(?:postgres|supabase|sql|query|relation|column|schema|constraint|policy|rls|function)/gi, 'data');
  }

  isSecureContext(): boolean {
    if (typeof window === 'undefined') return true;
    return window.isSecureContext || window.location.hostname === 'localhost';
  }

  generateDeviceId(): string {
    if (typeof window === 'undefined') return 'server';
    const stored = localStorage.getItem('lms_device_id');
    if (stored) return stored;
    const id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem('lms_device_id', id);
    return id;
  }
}

export const securityService = new SecurityService();
