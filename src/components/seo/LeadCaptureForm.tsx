import { memo, useState, useCallback } from 'react';
import { Send, Loader, CheckCircle } from 'lucide-react';
import { useMarketing } from '@/hooks/useMarketing';

interface LeadCaptureFormProps { examTarget?: string; source?: string; landingPage?: string; title?: string; }

function LeadCaptureFormComponent({ examTarget, source = 'landing_page', landingPage, title = 'Get Free Counseling' }: LeadCaptureFormProps) {
  const { loading, error, success, captureLead, reset } = useMarketing();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const handleSubmit = useCallback(async (e: React.FormEvent) => { e.preventDefault(); if (!email) return; const ok = await captureLead({ name, email, phone }); if (ok) { setName(''); setEmail(''); setPhone(''); setTimeout(reset, 5000); } }, [name, email, phone, examTarget, source, landingPage, captureLead, reset]);
  if (success) { return (<div className="rounded-xl border border-success-200 bg-success-50 p-6 text-center"><CheckCircle className="mx-auto mb-2 h-10 w-10 text-success-600" /><p className="text-sm font-semibold text-success-700">Thank you! We'll contact you soon.</p></div>); }
  return (<div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><h3 className="mb-4 text-sm font-semibold text-neutral-900">{title}</h3><form onSubmit={handleSubmit} className="space-y-3"><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" aria-label="Your name" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" aria-label="Email address" /><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" aria-label="Phone number" />{error && <p className="text-xs text-error-600">{error}</p>}<button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50">{loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit</button></form></div>);
}
export const LeadCaptureForm = memo(LeadCaptureFormComponent);
