import { memo, useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { MetaManager, StructuredData, SocialShareCard, BreadcrumbSEO } from '@/components/seo';
import { seoService } from '@/services/seo';
import type { BlogPost } from '@/services/seo';

function BlogDetailsPageComponent() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const loadPost = useCallback(async () => { if (!slug) return; try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { data, error } = await supabase.from('blog_posts').select('*, category:blog_categories(*)').eq('slug', slug).eq('status', 'published').maybeSingle(); if (!error && data) setPost(data as unknown as BlogPost); } catch { /* ignore */ } setLoading(false); }, [slug]);
  useEffect(() => { void loadPost(); }, [loadPost]);
  if (loading) return <div className="flex h-40 items-center justify-center text-neutral-400">Loading...</div>;
  if (!post) return <div className="flex h-40 items-center justify-center text-neutral-400">Article not found.</div>;
  const meta = seoService.generateBlogMeta(post.title, post.excerpt ?? '', post.slug);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nursinglms.com';
  return (<><MetaManager title={meta.title ?? post.title} description={meta.description ?? post.excerpt ?? ''} canonicalPath={`/blog/${post.slug}`} ogType="article" /><StructuredData type="article" data={{ headline: post.title, description: post.excerpt ?? '', author: post.authorName ?? 'Admin', datePublished: post.publishedAt ?? post.createdAt, image: post.featuredImage ?? undefined, url: `${baseUrl}/blog/${post.slug}` }} /><BreadcrumbSEO items={[{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: `/blog/${post.slug}` }]} /><div className="mx-auto max-w-3xl px-4 py-8"><Link to="/blog" className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link><h1 className="mb-3 text-3xl font-bold text-neutral-900">{post.title}</h1><div className="mb-6 flex items-center gap-4 text-sm text-neutral-400">{post.authorName && <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.authorName}</span>}{post.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(post.publishedAt).toLocaleDateString()}</span>}</div>{post.featuredImage && <img src={post.featuredImage} alt={post.title} className="mb-6 w-full rounded-xl object-cover" />}<div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} /><div className="mt-8 border-t border-neutral-200 pt-4"><SocialShareCard config={{ url: `${baseUrl}/blog/${post.slug}`, title: post.title, description: post.excerpt ?? '' }} /></div></div></>);
}
export const BlogDetailsPage = memo(BlogDetailsPageComponent);
