import { useState, useEffect, useCallback } from 'react';
import { Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { RewardHistory } from '@/components/gamification';
import { rewardService } from '@/services/gamification';
import type { RewardPoint } from '@/services/gamification';

export function StudentRewardHistoryPage() {
  const [rewards, setRewards] = useState<RewardPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');

  const fetchRewards = useCallback(async () => {
    if (!studentId.trim()) return;
    setLoading(true);
    const { data } = await rewardService.getByStudentAdmin(studentId);
    setRewards(data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchRewards(); }, [fetchRewards]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Student Reward History</h1>
        <p className="mt-1 text-sm text-neutral-500">View reward point history for a student</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            label="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter student UUID..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Coins className="h-4 w-4 text-amber-500" /> Reward History</CardTitle></CardHeader>
        <CardContent>
          {studentId ? (
            <RewardHistory rewards={rewards} loading={loading} />
          ) : (
            <div className="py-8 text-center text-sm text-neutral-500">Enter a student ID to view their reward history</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
