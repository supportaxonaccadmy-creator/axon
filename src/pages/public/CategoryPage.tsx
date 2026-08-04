import { memo, useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MetaManager, StructuredData, BreadcrumbSEO } from '@/components/seo';
import type { BlogPost } from '@/services/seo';

function CategoryPageComponent() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const loadData = useCallback(async () => { if (!slug) return; try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { data: cat } = await supabase.from('blog_categories').select('*').eq('slug', slug).maybeSingle(); if (cat) setCategoryName((cat as Record<string, string>).name ?? ''); const { data: postsData } = await supabase.from('blog_posts').select('*, category:blog_categories(*)').eq('category_id', (cat as Record<string, string>)?.id ?? '').eq('status', 'published').order('published_at', { ascending: false }); if (postsData) setPosts(postsData as unknown as BlogPost[]); } catch { /* ignore */ } setLoading(false); }, [slug]);
  useEffect(() => { void loadData(); }, [loadData]);
  return (<><MetaManager title={`${categoryName || 'Category'} - Blog | Nursing LMS`} description={`Articles in ${categoryName} category for nursing exam preparation`} canonicalPath={`/blog/category/${slug}`} /><StructuredData type="breadcrumb" data={{ items: [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }, { name: categoryName || 'Category', url: `/blog/category/${slug}` }] }} /><BreadcrumbSEO items={[{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: categoryName || 'Category', path: `/blog/category/${slug ?? ''}` }]} /><div className="mx-auto max-w-4xl px-4 py-8"><Link to="/blog" className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-primary-600"><ArrowLeft className="h-4 w-4" /> Back to Blog</Link><h1 className="mb-6 text-3xl font-bold text-neutral-900">{categoryName || 'Category'}</h1>{loading ? <p className="text-sm text-neutral-400">Loading...</p> : posts.length === 0 ? <p className="text-sm text-neutral-400">No articles in this category.</p> : (<div className="grid grid-cols-1 gap-6 md:grid-cols-2">{posts.map((post) => (<article key={post.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">{post.featuredImage && <Link to={`/blog/${post.slug}`}><img src={post.featuredImage} alt={post.title} className="h-48 w-full object-cover" /></Link>}<div className="p-5"><Link to={`/blog/${post.slug}`}><h2 className="mb-2 text-lg font-semibold text-neutral-900 hover:text-primary-600">{post.title}</h2></Link><p className="text-sm text-neutral-600">{post.excerpt ?? ''}</p></div></article>))}</div>)}</div></>);
}
export const CategoryPage = memo(CategoryPageComponent);
