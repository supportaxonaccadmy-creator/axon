import { useMemo, useState, useCallback } from 'react';
import { Sparkles, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { RecommendationCard } from '@/components/ai';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useCurrentUser } from '@/hooks/useProfile';
import { RECOMMENDATION_TYPE_LABELS } from '@/services/ai';
import type { RecommendationType } from '@/services/ai';

export function RecommendationsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { recommendations, loading, dismiss, markCompleted } = useRecommendations(studentId);
  const [filter, setFilter] = useState<RecommendationType | null>(null);

  const filtered = useMemo(() => {
    if (!filter) return recommendations;
    return recommendations.filter((r) => r.type === filter);
  }, [recommendations, filter]);

  const handleFilter = useCallback((type: RecommendationType | null) => setFilter(type), []);

  const types = Object.keys(RECOMMENDATION_TYPE_LABELS) as RecommendationType[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><Sparkles className="h-5 w-5 text-primary-500" /> Smart Recommendations</h1>
        <p className="mt-1 text-sm text-neutral-500">AI-curated content recommendations tailored to your learning progress</p>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <button onClick={() => handleFilter(null)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === null ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'}`}>All</button>
            {types.map((type) => (
              <button key={type} onClick={() => handleFilter(type)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === type ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-500'}`}>
                {RECOMMENDATION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading recommendations...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Sparkles className="h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No recommendations available. Keep studying to get personalized suggestions!</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onDismiss={dismiss ? (id) => { void dismiss(id); } : undefined}
              onComplete={markCompleted ? (id) => { void markCompleted(id); } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
