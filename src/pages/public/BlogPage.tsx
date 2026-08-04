import { memo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User } from 'lucide-react';
import { MetaManager, StructuredData } from '@/components/seo';
import { seoService } from '@/services/seo';
import type { BlogPost } from '@/services/seo';

function BlogPageComponent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const loadPosts = useCallback(async () => { try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { data, error } = await supabase.from('blog_posts').select('*, category:blog_categories(*)').eq('status', 'published').order('published_at', { ascending: false }); if (!error && data) setPosts(data as unknown as BlogPost[]); } catch { /* ignore */ } setLoading(false); }, []);
  useEffect(() => { void loadPosts(); }, [loadPosts]);
  const filtered = search ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase())) : posts;
  return (<><MetaManager title={`Blog - Nursing Exam Tips & Guides | ${seoService.getSiteUrl()}`} description="Expert articles, tips, and guides for nursing exam preparation. NORCET, AIIMS, ESIC, DSSSB, CHO, RRB Nursing Officer." keywords="nursing blog, nursing exam tips, nursing exam preparation, NORCET, AIIMS" canonicalPath="/blog" /><StructuredData type="website" /><div className="mx-auto max-w-4xl px-4 py-8"><h1 className="mb-2 text-3xl font-bold text-neutral-900">Blog</h1><p className="mb-6 text-neutral-600">Expert tips and guides for nursing exam preparation</p><div className="mb-6 flex items-center gap-2"><Search className="h-4 w-4 text-neutral-400" /><input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" aria-label="Search blog posts" /></div>{loading ? <p className="text-sm text-neutral-400">Loading articles...</p> : filtered.length === 0 ? (<div className="flex h-40 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400"><p className="text-sm">No articles found.</p></div>) : (<div className="grid grid-cols-1 gap-6 md:grid-cols-2">{filtered.map((post) => (<article key={post.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">{post.featuredImage && <Link to={`/blog/${post.slug}`}><img src={post.featuredImage} alt={post.title} className="h-48 w-full object-cover" /></Link>}<div className="p-5"><Link to={`/blog/${post.slug}`}><h2 className="mb-2 text-lg font-semibold text-neutral-900 hover:text-primary-600">{post.title}</h2></Link><p className="mb-3 text-sm text-neutral-600">{post.excerpt ?? ''}</p><div className="flex items-center gap-3 text-xs text-neutral-400">{post.authorName && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.authorName}</span>}{post.publishedAt && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.publishedAt).toLocaleDateString()}</span>}</div></div></article>))}</div>)}</div></>);
}
export const BlogPage = memo(BlogPageComponent);
