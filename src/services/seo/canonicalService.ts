class CanonicalService {
  private baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nursinglms.com';
  setCanonical(path: string): void { if (typeof document === 'undefined') return; const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`; let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null; if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = url; }
  getCanonical(): string | null { if (typeof document === 'undefined') return null; const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null; return link?.href ?? null; }
  removeCanonical(): void { if (typeof document === 'undefined') return; const link = document.querySelector('link[rel="canonical"]'); if (link) link.remove(); }
  setHreflang(hreflangs: { lang: string; url: string }[]): void { if (typeof document === 'undefined') return; document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove()); for (const { lang, url } of hreflangs) { const link = document.createElement('link'); link.rel = 'alternate'; link.hreflang = lang; link.href = url; document.head.appendChild(link); } }
  getCurrentPath(): string { if (typeof window === 'undefined') return '/'; return window.location.pathname; }
  buildCanonicalUrl(path: string): string { return path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`; }
}

export const canonicalService = new CanonicalService();
