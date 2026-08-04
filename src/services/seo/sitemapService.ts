import type { SitemapEntry } from './seo.types';

class SitemapService {
  private baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nursinglms.com';
  generateSitemap(entries: SitemapEntry[]): string {
    const urls = entries.map((entry) => { let url = `  <url>\n    <loc>${this.escapeXml(entry.url)}</loc>`; if (entry.lastmod) url += `\n    <lastmod>${entry.lastmod}</lastmod>`; if (entry.changefreq) url += `\n    <changefreq>${entry.changefreq}</changefreq>`; if (entry.priority !== undefined) url += `\n    <priority>${entry.priority}</priority>`; url += '\n  </url>'; return url; });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
  }
  getStaticPages(): SitemapEntry[] {
    return [{ url: `${this.baseUrl}/`, changefreq: 'weekly', priority: 1.0, lastmod: new Date().toISOString() }, { url: `${this.baseUrl}/blog`, changefreq: 'daily', priority: 0.9 }, { url: `${this.baseUrl}/landing/norcet`, changefreq: 'monthly', priority: 0.8 }, { url: `${this.baseUrl}/landing/nursing-officer`, changefreq: 'monthly', priority: 0.8 }, { url: `${this.baseUrl}/landing/aiims`, changefreq: 'monthly', priority: 0.8 }, { url: `${this.baseUrl}/landing/esic`, changefreq: 'monthly', priority: 0.8 }, { url: `${this.baseUrl}/landing/dsssb`, changefreq: 'monthly', priority: 0.8 }, { url: `${this.baseUrl}/landing/cho`, changefreq: 'monthly', priority: 0.8 }, { url: `${this.baseUrl}/landing/rrb-nursing-officer`, changefreq: 'monthly', priority: 0.8 }];
  }
  async getDynamicPages(): Promise<SitemapEntry[]> {
    try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const [batches, posts, categories] = await Promise.all([supabase.from('batches').select('slug,updated_at').eq('is_active', true), supabase.from('blog_posts').select('slug,published_at').eq('status', 'published'), supabase.from('blog_categories').select('slug')]); const entries: SitemapEntry[] = []; if (batches.data) for (const b of batches.data) { const entry: SitemapEntry = { url: `${this.baseUrl}/student/batches/${(b as Record<string, unknown>).slug}`, changefreq: 'weekly', priority: 0.7 }; const updated = (b as Record<string, string>).updated_at; if (updated) entry.lastmod = updated; entries.push(entry); } if (posts.data) for (const p of posts.data) { const entry: SitemapEntry = { url: `${this.baseUrl}/blog/${(p as Record<string, unknown>).slug}`, changefreq: 'monthly', priority: 0.6 }; const published = (p as Record<string, string>).published_at; if (published) entry.lastmod = published; entries.push(entry); } if (categories.data) for (const c of categories.data) entries.push({ url: `${this.baseUrl}/blog/category/${(c as Record<string, unknown>).slug}`, changefreq: 'weekly', priority: 0.5 }); return entries; } catch { return []; }
  }
  async generateFullSitemap(): Promise<string> { const staticPages = this.getStaticPages(); const dynamicPages = await this.getDynamicPages(); return this.generateSitemap([...staticPages, ...dynamicPages]); }
  private escapeXml(text: string): string { return text.replace(/[<>&'"]/g, (c) => { const map: Record<string, string> = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }; return map[c] ?? c; }); }
}

export const sitemapService = new SitemapService();
