import type { SEOMeta } from './seo.types';

class SEOService {
  private defaultTitle = 'Enterprise Nursing LMS';
  private defaultDescription = 'Enterprise Learning Management System for Nursing Education - NORCET, AIIMS, ESIC, DSSSB, CHO, RRB Nursing Officer preparation';
  private defaultKeywords = 'nursing exam, NORCET, AIIMS, ESIC, DSSSB, CHO, RRB nursing officer, nursing coaching, nursing LMS';
  private siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nursinglms.com';

  getDefaultMeta(): SEOMeta {
    return { title: this.defaultTitle, description: this.defaultDescription, keywords: this.defaultKeywords, canonicalUrl: this.siteUrl, ogTitle: this.defaultTitle, ogDescription: this.defaultDescription, ogType: 'website', twitterCard: 'summary_large_image', robots: 'index, follow' };
  }

  generateCourseMeta(courseName: string, courseType: string, description: string): SEOMeta {
    const title = `${courseName} - ${courseType} Coaching | ${this.defaultTitle}`;
    const metaDescription = description.slice(0, 160);
    const keywords = `${courseName}, ${courseType}, nursing exam, nursing coaching, ${courseName} preparation`;
    return { title, description: metaDescription, keywords, canonicalUrl: `${this.siteUrl}/course/${this.slugify(courseName)}`, ogTitle: title, ogDescription: metaDescription, ogType: 'website', twitterCard: 'summary_large_image', twitterTitle: title, twitterDescription: metaDescription, robots: 'index, follow' };
  }

  generateBatchMeta(batchName: string, subjects: string[], description: string): SEOMeta {
    const title = `${batchName} - Nursing Exam Preparation | ${this.defaultTitle}`;
    const metaDescription = `Prepare for ${batchName} with expert-led courses in ${subjects.join(', ')}. ${description.slice(0, 100)}`;
    return { title, description: metaDescription.slice(0, 160), keywords: `${batchName}, ${subjects.join(', ')}, nursing exam preparation`, canonicalUrl: `${this.siteUrl}/batch/${this.slugify(batchName)}`, ogTitle: title, ogDescription: metaDescription.slice(0, 160), ogType: 'website', twitterCard: 'summary_large_image', robots: 'index, follow' };
  }

  generateBlogMeta(title: string, excerpt: string, slug: string): SEOMeta {
    const metaTitle = `${title} | ${this.defaultTitle}`;
    const metaDescription = excerpt.slice(0, 160);
    return { title: metaTitle, description: metaDescription, canonicalUrl: `${this.siteUrl}/blog/${slug}`, ogTitle: metaTitle, ogDescription: metaDescription, ogType: 'article', twitterCard: 'summary_large_image', robots: 'index, follow' };
  }

  generateLandingPageMeta(examName: string, description: string): SEOMeta {
    const title = `${examName} Coaching - Best Online Preparation | ${this.defaultTitle}`;
    const metaDescription = `Prepare for ${examName} with comprehensive online courses, mock tests, and expert guidance. ${description.slice(0, 80)}`;
    return { title, description: metaDescription.slice(0, 160), keywords: `${examName}, ${examName} coaching, ${examName} preparation, ${examName} online course, nursing exam`, canonicalUrl: `${this.siteUrl}/landing/${this.slugify(examName)}`, ogTitle: title, ogDescription: metaDescription.slice(0, 160), ogType: 'website', twitterCard: 'summary_large_image', robots: 'index, follow' };
  }

  slugify(text: string): string { return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  truncateTitle(title: string, maxLength: number = 60): string { return title.length > maxLength ? title.slice(0, maxLength - 3) + '...' : title; }
  truncateDescription(description: string, maxLength: number = 160): string { return description.length > maxLength ? description.slice(0, maxLength - 3) + '...' : description; }
  getSiteUrl(): string { return this.siteUrl; }
}

export const seoService = new SEOService();
