import type { SocialShareConfig } from './seo.types';

class SocialMetaService {
  setSocialMeta(config: SocialShareConfig): void {
    if (typeof document === 'undefined') return;
    const setMeta = (property: string, content: string) => { let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null; if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag); } tag.content = content; };
    setMeta('og:title', config.title); setMeta('og:description', config.description); setMeta('og:url', config.url); setMeta('og:type', 'website');
    if (config.image) setMeta('og:image', config.image);
    const twitterMeta: Record<string, string> = { 'twitter:card': 'summary_large_image', 'twitter:title': config.title, 'twitter:description': config.description };
    if (config.image) twitterMeta['twitter:image'] = config.image;
    for (const [name, content] of Object.entries(twitterMeta)) { let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null; if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', name); document.head.appendChild(tag); } tag.content = content; }
  }
  getShareUrl(platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram', config: SocialShareConfig): string {
    const url = encodeURIComponent(config.url); const title = encodeURIComponent(config.title);
    switch (platform) {
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'twitter': return `https://twitter.com/intent/tweet?url=${url}&text=${title}${config.hashtags ? `&hashtags=${config.hashtags.join(',')}` : ''}`;
      case 'linkedin': return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      case 'whatsapp': return `https://wa.me/?text=${title}%20${url}`;
      case 'telegram': return `https://t.me/share/url?url=${url}&text=${title}`;
    }
  }
  share(platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'telegram', config: SocialShareConfig): void {
    const shareUrl = this.getShareUrl(platform, config);
    if (platform === 'whatsapp' || platform === 'telegram') { window.open(shareUrl, '_blank', 'noopener,noreferrer'); } else { window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer'); }
  }
  copyLink(url: string): Promise<boolean> { if (typeof navigator === 'undefined' || !navigator.clipboard) return Promise.resolve(false); return navigator.clipboard.writeText(url).then(() => true).catch(() => false); }
}

export const socialMetaService = new SocialMetaService();
