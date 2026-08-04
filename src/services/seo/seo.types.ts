export interface SEOMeta {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  noindex?: boolean;
}

export interface SchemaType {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  authorName: string | null;
  categoryId: string | null;
  status: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: string;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  subscribedAt: string;
}

export interface MarketingLead {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  examTarget: string | null;
  source: string | null;
  landingPage: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface SEOSettings {
  key: string;
  value: string;
  category: string;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface LandingPageConfig {
  slug: string;
  examName: string;
  title: string;
  subtitle: string;
  description: string;
  keywords: string[];
  features: string[];
  faqs: { question: string; answer: string }[];
  ogImage?: string;
}

export interface SocialShareConfig {
  url: string;
  title: string;
  description: string;
  image?: string;
  hashtags?: string[];
}

export interface AnalyticsConfig {
  ga4Id?: string;
  gtmId?: string;
  searchConsoleVerification?: string;
  metaPixelId?: string;
}
