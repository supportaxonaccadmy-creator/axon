import { useCallback, useState, useEffect } from 'react';
import { Plus, Trash2, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { missionService } from '@/services/gamification';
import { useCurrentUser } from '@/hooks/useProfile';
import { MISSION_TYPE_LABELS, MISSION_ACTION_LABELS } from '@/services/gamification';
import type { Mission, CreateMissionInput, MissionType, MissionAction } from '@/services/gamification';

export function MissionManagementPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateMissionInput>({ name: '', description: '', type: 'daily', action: 'custom', targetCount: 1, xpReward: 10, pointsReward: 5 });

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    const { data } = await missionService.getAllAdmin();
    setMissions(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchMissions(); }, [fetchMissions]);

  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await missionService.create(adminId, form);
    setForm({ name: '', description: '', type: 'daily', action: 'custom', targetCount: 1, xpReward: 10, pointsReward: 5 });
    setShowForm(false);
    void fetchMissions();
  }, [form, adminId, fetchMissions]);

  const handleDelete = useCallback(async (id: string) => {
    await missionService.delete(id);
    void fetchMissions();
  }, [fetchMissions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Missions</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage student missions</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="h-4 w-4" /> New Mission
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create Mission</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <Textarea label="Description" value={form.description ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} rows={2} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Type</label>
                  <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as MissionType }))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                    {Object.entries(MISSION_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">Action</label>
                  <select value={form.action} onChange={(e) => setForm((prev) => ({ ...prev, action: e.target.value as MissionAction }))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                    {Object.entries(MISSION_ACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Target Count" type="number" value={form.targetCount} onChange={(e) => setForm((prev) => ({ ...prev, targetCount: Number(e.target.value) }))} />
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
      ) : missions.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Target className="mx-auto h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No missions yet</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {missions.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
              <Target className="h-5 w-5 text-primary-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900">{m.name}</p>
                <p className="text-xs text-neutral-400">{MISSION_TYPE_LABELS[m.type]} · {MISSION_ACTION_LABELS[m.action]} · {m.targetCount}x · +{m.xpReward} XP · +{m.pointsReward} pts</p>
              </div>
              <button onClick={() => handleDelete(m.id)} className="rounded-md p-1 text-error-500 hover:bg-error-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
