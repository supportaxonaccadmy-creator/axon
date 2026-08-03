class ManifestService {
  getManifest(): Record<string, unknown> | null {
    if (typeof document === 'undefined') return null;
    const link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!link || !link.href) return null;
    return { href: link.href, rel: link.rel };
  }

  updateThemeColor(color: string): void {
    if (typeof document === 'undefined') return;
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = color;
  }

  setAppleTouchIcon(href: string): void {
    if (typeof document === 'undefined') return;
    let link = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      document.head.appendChild(link);
    }
    link.href = href;
  }

  isStandalone(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }
}

export const manifestService = new ManifestService();
