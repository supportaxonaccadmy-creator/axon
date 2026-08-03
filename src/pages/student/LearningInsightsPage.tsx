import { useMemo } from 'react';
import { Sparkles, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LearningInsightCard, LearningScoreCard, ProgressPredictionCard } from '@/components/ai';
import { useLearningInsights } from '@/hooks/useLearningInsights';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import { useCurrentUser } from '@/hooks/useProfile';
import { INSIGHT_TYPE_LABELS } from '@/services/ai';
import type { InsightType, LearningInsight } from '@/services/ai';

export function LearningInsightsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { insights, unreadCount, loading, markRead, markAllRead } = useLearningInsights(studentId);
  const { analytics, prediction } = useAiAssistant(studentId);

  const grouped = useMemo(() => {
    const groups: Partial<Record<InsightType, LearningInsight[]>> = {};
    insights.forEach((i) => {
      const key = i.type;
      if (!groups[key]) groups[key] = [];
      groups[key]!.push(i);
    });
    return groups;
  }, [insights]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><Sparkles className="h-5 w-5 text-primary-500" /> Learning Insights</h1>
          <p className="mt-1 text-sm text-neutral-500">AI-generated insights about your learning patterns and performance</p>
        </div>
        {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => void markAllRead()}><CheckCheck className="h-4 w-4" /> Mark all read ({unreadCount})</Button>}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading insights...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LearningScoreCard analytics={analytics} />
            <ProgressPredictionCard prediction={prediction} />
          </div>

          {insights.length === 0 ? (
            <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Sparkles className="h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">No insights yet. Start studying to get AI-generated insights!</p></CardContent></Card>
          ) : (
            <div className="space-y-6">
              {(Object.keys(grouped) as InsightType[]).map((type) => (
                <Card key={type}>
                  <CardHeader><CardTitle>{INSIGHT_TYPE_LABELS[type]} ({grouped[type]?.length ?? 0})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {(grouped[type] ?? []).map((insight) => (
                        <LearningInsightCard key={insight.id} insight={insight} onMarkRead={markRead ? (id) => void markRead(id) : undefined} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
