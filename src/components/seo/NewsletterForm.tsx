import { memo, useState, useCallback } from 'react';
import { Mail, Loader, CheckCircle } from 'lucide-react';
import { useMarketing } from '@/hooks/useMarketing';

interface NewsletterFormProps { source?: string; compact?: boolean; }

function NewsletterFormComponent({ source = 'footer', compact }: NewsletterFormProps) {
  const { loading, error, success, subscribeNewsletter, reset } = useMarketing();
  const [email, setEmail] = useState('');
  const handleSubmit = useCallback(async (e: React.FormEvent) => { e.preventDefault(); if (!email) return; const ok = await subscribeNewsletter(email, source); if (ok) { setEmail(''); setTimeout(reset, 5000); } }, [email, source, subscribeNewsletter, reset]);
  if (success) { return (<div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'rounded-xl border border-success-200 bg-success-50 p-4'}`}><CheckCircle className="h-5 w-5 text-success-600" /><span className="text-sm font-medium text-success-700">Subscribed successfully!</span></div>); }
  return (<form onSubmit={handleSubmit} className={compact ? 'flex gap-2' : 'space-y-3'}><div className="relative flex-1"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className={`w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none ${compact ? '' : 'w-full'}`} aria-label="Email for newsletter" /></div><button type="submit" disabled={loading} className={`flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50 ${compact ? '' : 'w-full justify-center'}`}>{loading ? <Loader className="h-4 w-4 animate-spin" /> : null} Subscribe</button>{error && <p className="text-xs text-error-600">{error}</p>}</form>);
}
export const NewsletterForm = memo(NewsletterFormComponent);
