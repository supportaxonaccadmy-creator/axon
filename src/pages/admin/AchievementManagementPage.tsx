import { useCallback, useState } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AchievementCard } from '@/components/gamification';
import { useAchievements } from '@/hooks/useAchievements';
import { useCurrentUser } from '@/hooks/useProfile';
import { ACHIEVEMENT_CATEGORY_LABELS } from '@/services/gamification';
import type { CreateAchievementInput, AchievementCategory } from '@/services/gamification';

export function AchievementManagementPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const { achievements, loading, createAchievement, deleteAchievement } = useAchievements(null, true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateAchievementInput>({ name: '', description: '', icon: '', category: 'learning', xpReward: 0, pointsReward: 0 });

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createAchievement(adminId, form);
    setForm({ name: '', description: '', icon: '', category: 'learning', xpReward: 0, pointsReward: 0 });
    setShowForm(false);
  }, [form, adminId, createAchievement]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Achievements</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage student achievements</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="h-4 w-4" /> New Achievement
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Achievement</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Category</label>
                  <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as AchievementCategory }))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                    {Object.entries(ACHIEVEMENT_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <Input label="XP Reward" type="number" value={form.xpReward} onChange={(e) => setForm((prev) => ({ ...prev, xpReward: Number(e.target.value) }))} />
                <Input label="Points Reward" type="number" value={form.pointsReward} onChange={(e) => setForm((prev) => ({ ...prev, pointsReward: Number(e.target.value) }))} />
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
      ) : achievements.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Trophy className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No achievements yet</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <div key={a.id} className="relative">
              <AchievementCard achievement={a} unlocked />
              <button onClick={() => void deleteAchievement(a.id)} className="absolute right-3 top-3 rounded-md p-1 text-error-500 hover:bg-error-50" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
