import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Video, Monitor, PlayCircle, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { meetingProviderService } from '@/services/live';
import { PROVIDER_LABELS } from '@/services/live';
import type { MeetingProvider, MeetingProviderType } from '@/services/live';

const PROVIDER_ICONS: Record<MeetingProviderType, typeof Video> = {
  zoom: Video, google_meet: Monitor, jitsi_meet: Video,
  microsoft_teams: Monitor, youtube_live: PlayCircle, custom_url: Link2,
};

export function MeetingProvidersPage() {
  const [providers, setProviders] = useState<MeetingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MeetingProvider | null>(null);
  const [form, setForm] = useState({ name: '', providerType: 'custom_url' as MeetingProviderType, apiKey: '', apiSecret: '', serverUrl: '' });

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    const { data } = await meetingProviderService.getAll();
    setProviders(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchProviders(); }, [fetchProviders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const input = { name: form.name.trim(), providerType: form.providerType, apiKey: form.apiKey || null, apiSecret: form.apiSecret || null, serverUrl: form.serverUrl || null };
    if (editing) { await meetingProviderService.update(editing.id, input); }
    else { await meetingProviderService.create(input); }
    setForm({ name: '', providerType: 'custom_url', apiKey: '', apiSecret: '', serverUrl: '' });
    setEditing(null); setShowForm(false); void fetchProviders();
  };

  const handleEdit = (p: MeetingProvider) => {
    setEditing(p);
    setForm({ name: p.name, providerType: p.providerType, apiKey: p.apiKey ?? '', apiSecret: p.apiSecret ?? '', serverUrl: p.serverUrl ?? '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => { await meetingProviderService.delete(id); void fetchProviders(); };
  const handleToggle = async (id: string, isActive: boolean) => { await meetingProviderService.setActive(id, isActive); void fetchProviders(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Meeting Providers</h1>
          <p className="mt-1 text-sm text-neutral-500">Configure meeting provider integrations</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', providerType: 'custom_url', apiKey: '', apiSecret: '', serverUrl: '' }); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Provider
        </Button>
      </div>
      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit Provider' : 'Add Provider'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Provider Type</label>
                  <select value={form.providerType} onChange={(e) => setForm((p) => ({ ...p, providerType: e.target.value as MeetingProviderType }))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                    {Object.entries(PROVIDER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="API Key" value={form.apiKey} onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))} />
                <Input label="API Secret" type="password" value={form.apiSecret} onChange={(e) => setForm((p) => ({ ...p, apiSecret: e.target.value }))} />
              </div>
              <Input label="Server URL" value={form.serverUrl} onChange={(e) => setForm((p) => ({ ...p, serverUrl: e.target.value }))} />
              <div className="flex items-center gap-2">
                <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {loading ? (
        <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>
      ) : providers.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Video className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No providers configured</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => {
            const Icon = PROVIDER_ICONS[p.providerType] ?? Link2;
            return (
              <Card key={p.id} hover>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                        <Icon className="h-5 w-5 text-neutral-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{p.name}</p>
                        <p className="text-xs text-neutral-400">{PROVIDER_LABELS[p.providerType]}</p>
                      </div>
                    </div>
                    <Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
                    <button onClick={() => handleToggle(p.id, !p.isActive)} className="rounded-md px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100">{p.isActive ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => handleEdit(p)} className="rounded-md p-1 text-primary-600 hover:bg-primary-50"><Edit className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-md p-1 text-error-500 hover:bg-error-50"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}