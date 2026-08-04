import type { DomainConfig } from './devops.types';

class DomainService {
  getDomainConfig(): DomainConfig { const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'; return { primary: hostname, aliases: [], enforceHttps: true, enforceWwwRedirect: false, canonicalDomain: hostname }; }
  validateDomain(): { valid: boolean; message: string } { const hostname = typeof window !== 'undefined' ? window.location.hostname : ''; if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') return { valid: false, message: 'Running on localhost - custom domain not configured' }; return { valid: true, message: `Domain ${hostname} is configured` }; }
  isHttps(): boolean { if (typeof window === 'undefined') return false; return window.location.protocol === 'https:'; }
  getCanonicalUrl(): string { if (typeof window === 'undefined') return ''; return window.location.origin; }
  getMultiDomainConfig(): { domain: string; environment: string; description: string }[] { return [ { domain: 'nursinglms.com', environment: 'production', description: 'Primary production domain' }, { domain: 'staging.nursinglms.com', environment: 'staging', description: 'Staging environment for testing' }, { domain: 'dev.nursinglms.com', environment: 'development', description: 'Development environment' } ]; }
  getRedirectRules(): { from: string; to: string; type: string; description: string }[] { return [ { from: 'http://*', to: 'https://$1', type: '301', description: 'Force HTTPS redirect' }, { from: 'www.nursinglms.com', to: 'nursinglms.com', type: '301', description: 'WWW to non-WWW redirect' }, { from: 'nursinglms.com/*', to: 'nursinglms.com/$1', type: 'canonical', description: 'Canonical domain' } ]; }
}

export const domainService = new DomainService();
