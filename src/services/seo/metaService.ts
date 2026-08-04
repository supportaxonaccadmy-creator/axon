import type { SEOMeta } from './seo.types';

class MetaService {
  setTitle(title: string): void { if (typeof document === 'undefined') return; document.title = title; }
  setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name'): void { if (typeof document === 'undefined') return; let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null; if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attr, name); document.head.appendChild(tag); } tag.content = content; }
  setCanonical(url: string): void { if (typeof document === 'undefined') return; let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null; if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); } link.href = url; }
  setRobots(content: string): void { this.setMetaTag('robots', content); }
  setKeywords(keywords: string): void { this.setMetaTag('keywords', keywords); }
  setViewport(): void { this.setMetaTag('viewport', 'width=device-width, initial-scale=1.0'); }
  applyMeta(meta: SEOMeta): void {
    if (typeof document === 'undefined') return;
    this.setTitle(meta.title);
    this.setMetaTag('description', meta.description);
    if (meta.keywords) this.setKeywords(meta.keywords);
    if (meta.canonicalUrl) this.setCanonical(meta.canonicalUrl);
    if (meta.robots) this.setRobots(meta.robots);
    if (meta.noindex) this.setRobots('noindex, nofollow');
    if (meta.ogTitle) this.setMetaTag('og:title', meta.ogTitle, 'property');
    if (meta.ogDescription) this.setMetaTag('og:description', meta.ogDescription, 'property');
    if (meta.ogImage) this.setMetaTag('og:image', meta.ogImage, 'property');
    if (meta.ogType) this.setMetaTag('og:type', meta.ogType, 'property');
    if (meta.canonicalUrl) this.setMetaTag('og:url', meta.canonicalUrl, 'property');
    if (meta.twitterCard) this.setMetaTag('twitter:card', meta.twitterCard);
    if (meta.twitterTitle) this.setMetaTag('twitter:title', meta.twitterTitle);
    if (meta.twitterDescription) this.setMetaTag('twitter:description', meta.twitterDescription);
    if (meta.twitterImage) this.setMetaTag('twitter:image', meta.twitterImage);
  }
  removeMeta(name: string, attr: 'name' | 'property' = 'name'): void { if (typeof document === 'undefined') return; const tag = document.querySelector(`meta[${attr}="${name}"]`); if (tag) tag.remove(); }
  getMeta(name: string, attr: 'name' | 'property' = 'name'): string | null { if (typeof document === 'undefined') return null; const tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null; return tag?.content ?? null; }
}

export const metaService = new MetaService();
