import type { SslConfig } from './devops.types';

class SslService {
  getSslConfig(): SslConfig { return { enabled: this.isHttps(), hstsEnabled: import.meta.env.PROD, hstsMaxAge: 31536000, secureCookies: import.meta.env.PROD, mixedContentPrevention: true }; }
  isHttps(): boolean { if (typeof window === 'undefined') return false; return window.location.protocol === 'https:'; }
  validateSsl(): { valid: boolean; message: string } { if (typeof window === 'undefined') return { valid: false, message: 'Not in browser environment' }; if (window.location.protocol !== 'https:' && import.meta.env.PROD) return { valid: false, message: 'HTTPS is not enabled in production' }; if (window.location.protocol === 'https:') return { valid: true, message: 'SSL/HTTPS is active' }; return { valid: true, message: 'HTTP acceptable in development mode' }; }
  getHstsHeader(): string { return 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload'; }
  getSecurityHeaders(): { header: string; value: string; description: string }[] { return [ { header: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload', description: 'HSTS header for HTTPS enforcement' }, { header: 'X-Content-Type-Options', value: 'nosniff', description: 'Prevents MIME type sniffing' }, { header: 'X-Frame-Options', value: 'DENY', description: 'Prevents clickjacking' }, { header: 'X-XSS-Protection', value: '1; mode=block', description: 'XSS protection' }, { header: 'Referrer-Policy', value: 'strict-origin-when-cross-origin', description: 'Controls referrer information' }, { header: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'", description: 'Content Security Policy' } ]; }
  checkMixedContent(): { found: boolean; message: string } { if (typeof document === 'undefined') return { found: false, message: 'Not in browser environment' }; const httpResources = document.querySelectorAll('script[src^="http:"], img[src^="http:"], link[href^="http:"]'); return { found: httpResources.length > 0, message: httpResources.length > 0 ? `${httpResources.length} mixed content resources found` : 'No mixed content detected' }; }
}

export const sslService = new SslService();
