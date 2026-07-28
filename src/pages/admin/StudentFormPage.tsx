import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';

interface StudentFormPageProps { mode: 'create' | 'edit'; }

export function StudentFormPage({ mode }: StudentFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', isActive: true });

  const load = useCallback(async () => {
    if (mode === 'edit' && id) {
      const supabase = getSupabaseClient();
      const { data, error: err } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (err || !data) { setError(err?.message ?? 'Student not found'); setLoading(false); return; }
      const row = data as { full_name: string | null; email: string | null; mobile: string | null; is_active: boolean };
      setForm({ fullName: row.full_name ?? '', email: row.email ?? '', mobile: row.mobile ?? '', isActive: row.is_active });
      setLoading(false);
    }
  }, [mode, id]);

  useState(() => { load(); });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    const supabase = getSupabaseClient();
    if (mode === 'edit' && id) {
      const { error: updateError } = await supabase.from('profiles').update({ full_name: form.fullName.trim(), email: form.email.trim(), mobile: form.mobile.trim() || null, is_active: form.isActive }).eq('id', id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase.from('profiles').insert({ full_name: form.fullName.trim(), email: form.email.trim(), mobile: form.mobile.trim() || null, is_active: form.isActive, role: 'student', auth_user_id: crypto.randomUUID(), uuid: crypto.randomUUID() });
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }
    setSaving(false);
    navigate('/admin/students');
  }, [form, id, mode, navigate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/students')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Student' : 'Edit Student'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <Input label="Full Name" placeholder="e.g. John Doe" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} error={errors.fullName} />
        <Input label="Email" type="email" placeholder="e.g. john@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email} />
        <Input label="Mobile" placeholder="e.g. +91 98765 43210" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
        <Checkbox label="Active" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/students')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Student' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
