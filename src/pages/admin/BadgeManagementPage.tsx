import { useCallback, useState } from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { BadgeCard } from '@/components/gamification';
import { useAchievements } from '@/hooks/useAchievements';
import { useCurrentUser } from '@/hooks/useProfile';
import { BADGE_TIER_LABELS } from '@/services/gamification';
import type { CreateBadgeInput, BadgeTier } from '@/services/gamification';

export function BadgeManagementPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const { badges, loading, createBadge, deleteBadge } = useAchievements(null, true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateBadgeInput>({ name: '', description: '', icon: '', tier: 'bronze', color: '' });

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createBadge(adminId, form);
    setForm({ name: '', description: '', icon: '', tier: 'bronze', color: '' });
    setShowForm(false);
  }, [form, adminId, createBadge]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Badges</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage student badges</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="h-4 w-4" /> New Badge
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Badge</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Tier</label>
                  <select value={form.tier} onChange={(e) => setForm((prev) => ({ ...prev, tier: e.target.value as BadgeTier }))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                    {Object.entries(BADGE_TIER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <Input label="Icon (emoji or text)" value={form.icon ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))} placeholder="🏆" />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>
      ) : badges.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Award className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No badges yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {badges.map((b) => (
            <div key={b.id} className="relative">
              <BadgeCard badge={b} earned />
              <button onClick={() => void deleteBadge(b.id)} className="absolute right-2 top-2 rounded-md bg-white/80 p-1 text-error-500 hover:bg-error-50" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
