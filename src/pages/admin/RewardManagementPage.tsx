import { useCallback, useState, useEffect } from 'react';
import { Coins, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RewardHistory } from '@/components/gamification';
import { rewardService } from '@/services/gamification';
import { REWARD_TYPE_LABELS } from '@/services/gamification';
import type { RewardPoint, RewardType } from '@/services/gamification';
import type { Option } from '@/types/common';

export function RewardManagementPage() {
  const [rewards, setRewards] = useState<RewardPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', type: 'awarded' as RewardType, points: 10, description: '' });

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    const { data } = await rewardService.getAll();
    setRewards(data);
    setLoading(false);
  }, []);

  useEffect(() => { void fetchRewards(); }, [fetchRewards]);

  const handleAward = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId.trim()) return;
    await rewardService.award({
      studentId: form.studentId,
      type: form.type,
      amount: form.points,
      description: form.description || null,
    });
    setForm({ studentId: '', type: 'awarded', points: 10, description: '' });
    setShowForm(false);
    void fetchRewards();
  }, [form, fetchRewards]);

  const typeOptions: Option[] = Object.entries(REWARD_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Reward Points</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage student reward points</p>
        </div>
        <Button onClick={() => setShowForm((prev) => !prev)}>
          <Plus className="h-4 w-4" /> Award Points
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Award Points</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAward} className="space-y-4">
              <Input label="Student ID" value={form.studentId} onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))} placeholder="UUID" required />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Type" options={typeOptions} value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as RewardType }))} />
                <Input label="Points" type="number" value={form.points} onChange={(e) => setForm((prev) => ({ ...prev, points: Number(e.target.value) }))} />
              </div>
              <Input label="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Reason for award..." />
              <div className="flex items-center gap-2">
                <Button type="submit">Award</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-500" /> Recent Rewards</CardTitle></CardHeader>
        <CardContent>
          <RewardHistory rewards={rewards} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
