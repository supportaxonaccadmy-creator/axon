class RobotsService {
  private baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nursinglms.com';
  generateRobotsTxt(): string { return ['User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /student/dashboard', 'Disallow: /profile', 'Disallow: /login', 'Disallow: /register', 'Disallow: /reset-password', '', '# AI Search Engine Bots', 'User-agent: GPTBot', 'Allow: /', '', 'User-agent: ChatGPT-User', 'Allow: /', '', 'User-agent: PerplexityBot', 'Allow: /', '', 'User-agent: ClaudeBot', 'Allow: /', '', 'User-agent: anthropic-ai', 'Allow: /', '', 'User-agent: Googlebot', 'Allow: /', '', 'User-agent: Bingbot', 'Allow: /', '', `Sitemap: ${this.baseUrl}/sitemap.xml`].join('\n'); }
  getRobotsMeta(): string { return 'index, follow'; }
  getNoindexMeta(): string { return 'noindex, nofollow'; }
}

export const robotsService = new RobotsService();
