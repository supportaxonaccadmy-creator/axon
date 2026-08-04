import { memo, useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import type { BlogPost } from '@/services/seo';

function BlogManagementPageComponent() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const loadPosts = useCallback(async () => { try { const { getSupabaseClient } = await import('@/lib/supabase'); const supabase = getSupabaseClient(); const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }); if (!error && data) setPosts(data as unknown as BlogPost[]); } catch { /* ignore */ } setLoading(false); }, []);
  useEffect(() => { void loadPosts(); }, [loadPosts]);
  return (<PageContainer><SectionHeader title="Blog Management" description="Create and manage blog posts" /><div className="mb-4 flex justify-end"><button className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"><Plus className="h-4 w-4" /> New Post</button></div>{loading ? <p className="text-sm text-neutral-400">Loading posts...</p> : posts.length === 0 ? (<div className="flex h-40 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400"><div className="text-center"><FileText className="mx-auto mb-2 h-8 w-8" /><p className="text-sm">No blog posts yet. Create your first post!</p></div></div>) : (<div className="space-y-2">{posts.map((post) => (<div key={post.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3">{post.featuredImage ? <img src={post.featuredImage} alt={post.title} className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100"><FileText className="h-5 w-5 text-neutral-400" /></div>}<div><p className="text-sm font-medium text-neutral-900">{post.title}</p><p className="text-xs text-neutral-400">{post.authorName ?? 'Unknown'} | {post.status} | {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}</p></div></div><div className="flex gap-1"><button className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" aria-label="Edit post"><Edit className="h-4 w-4" /></button><button className="rounded-lg p-2 text-neutral-400 hover:bg-error-50 hover:text-error-600" aria-label="Delete post"><Trash2 className="h-4 w-4" /></button></div></div>))}</div>)}</PageContainer>);
}
export const BlogManagementPage = memo(BlogManagementPageComponent);
