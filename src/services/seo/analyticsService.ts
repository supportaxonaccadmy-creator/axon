import type { AnalyticsConfig } from './seo.types';

class AnalyticsService {
  private config: AnalyticsConfig = {};
  private initialized = false;
  setConfig(config: AnalyticsConfig): void { this.config = config; }
  init(): void {
    if (this.initialized || typeof document === 'undefined') return;
    this.initialized = true;
    if (this.config.ga4Id) this.injectGA4(this.config.ga4Id);
    if (this.config.gtmId) this.injectGTM(this.config.gtmId);
    if (this.config.metaPixelId) this.injectMetaPixel(this.config.metaPixelId);
    if (this.config.searchConsoleVerification) this.injectSearchConsoleVerification(this.config.searchConsoleVerification);
  }
  private injectGA4(measurementId: string): void {
    const script1 = document.createElement('script'); script1.async = true; script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`; document.head.appendChild(script1);
    const script2 = document.createElement('script'); script2.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${measurementId}');`; document.head.appendChild(script2);
  }
  private injectGTM(containerId: string): void {
    const script = document.createElement('script'); script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`; document.head.appendChild(script);
  }
  private injectMetaPixel(pixelId: string): void {
    const script = document.createElement('script'); script.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`; document.head.appendChild(script);
  }
  private injectSearchConsoleVerification(code: string): void { const meta = document.createElement('meta'); meta.name = 'google-site-verification'; meta.content = code; document.head.appendChild(meta); }
  trackPageView(path: string): void { if (typeof window === 'undefined') return; const gtag = (window as unknown as Record<string, ((...args: unknown[]) => void) | undefined>).gtag; if (typeof gtag !== 'function') return; gtag('event', 'page_view', { page_path: path }); }
  trackEvent(eventName: string, params?: Record<string, unknown>): void { if (typeof window === 'undefined') return; const gtag = (window as unknown as Record<string, (...args: unknown[]) => void>).gtag; if (typeof gtag === 'function') gtag('event', eventName, params); const fbq = (window as unknown as Record<string, (...args: unknown[]) => void>).fbq; if (typeof fbq === 'function') fbq('track', eventName, params); }
  trackConversion(conversionId: string, value?: number, currency?: string): void { this.trackEvent('conversion', { conversion_id: conversionId, value, currency: currency ?? 'INR' }); }
}

export const analyticsService = new AnalyticsService();
