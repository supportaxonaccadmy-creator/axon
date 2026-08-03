import { useMemo } from 'react';
import { RotateCw, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RevisionCard } from '@/components/ai';
import { revisionService } from '@/services/ai';
import { useCurrentUser } from '@/hooks/useProfile';
import { useState, useEffect, useCallback } from 'react';
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
import type { RevisionItem } from '@/services/ai';

export function RevisionPlannerPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const [dueItems, setDueItems] = useState<RevisionItem[]>([]);
  const [allItems, setAllItems] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    const [dueRes, allRes] = await Promise.all([
      revisionService.getDueToday(studentId),
      revisionService.getByStudent(studentId),
    ]);
    setDueItems(dueRes.data);
    setAllItems(allRes.data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const handleRevise = useCallback(async (id: string, confidence: number) => {
    const { error } = await revisionService.markRevised(id, confidence);
    if (!error) void fetchAll();
  }, [fetchAll]);

  const handleComplete = useCallback(async (id: string) => {
    const { error } = await revisionService.complete(id);
    if (!error) void fetchAll();
  }, [fetchAll]);

  const upcoming = useMemo(() => allItems.filter((i) => new Date(i.nextRevisionDate) > new Date()), [allItems]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><RotateCw className="h-5 w-5 text-primary-500" /> Revision Planner</h1>
        <p className="mt-1 text-sm text-neutral-500">Spaced repetition schedule to reinforce your learning</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading revision schedule...</div>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-orange-500" /> Due Today ({dueItems.length})</CardTitle></CardHeader>
            <CardContent>
              {dueItems.length === 0 ? (
                <p className="py-4 text-center text-sm text-neutral-500">No revisions due today. You are all caught up.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dueItems.map((item) => (
                    <RevisionCard key={item.id} item={item} onRevise={(id, conf) => { void handleRevise(id, conf); }} onComplete={(id) => { void handleComplete(id); }} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {upcoming.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Upcoming Revisions ({upcoming.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcoming.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                      <RotateCw className="h-4 w-4 text-blue-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-900">{item.topicName}</p>
                        <p className="text-xs text-neutral-400">Due {formatDate(item.nextRevisionDate)} · Revision #{item.revisionCount + 1}</p>
                      </div>
                      <span className="text-xs text-neutral-400">Confidence: {(item.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
