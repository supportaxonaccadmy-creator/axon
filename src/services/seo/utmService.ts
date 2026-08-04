import type { UTMParams } from './seo.types';

class UTMService {
  parseUTMFromUrl(url?: string): UTMParams { if (typeof window === 'undefined') return {}; const searchParams = new URLSearchParams(url ?? window.location.search); const params: UTMParams = {}; const utmKeys: (keyof UTMParams)[] = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']; for (const key of utmKeys) { const value = searchParams.get(key); if (value) params[key] = value; } return params; }
  buildUTMUrl(baseUrl: string, params: UTMParams): string { const url = new URL(baseUrl); for (const [key, value] of Object.entries(params)) { if (value) url.searchParams.set(key, value); } return url.toString(); }
  storeUTMParams(params: UTMParams): void { if (typeof sessionStorage === 'undefined') return; sessionStorage.setItem('lms_utm_params', JSON.stringify(params)); }
  getStoredUTMParams(): UTMParams { if (typeof sessionStorage === 'undefined') return {}; try { const stored = sessionStorage.getItem('lms_utm_params'); return stored ? JSON.parse(stored) as UTMParams : {}; } catch { return {}; } }
  clearStoredUTMParams(): void { if (typeof sessionStorage === 'undefined') return; sessionStorage.removeItem('lms_utm_params'); }
  hasUTMParams(): boolean { const params = this.parseUTMFromUrl(); return Object.keys(params).length > 0; }
  captureAndStore(): UTMParams { const params = this.parseUTMFromUrl(); if (Object.keys(params).length > 0) this.storeUTMParams(params); return params; }
}

export const utmService = new UTMService();
