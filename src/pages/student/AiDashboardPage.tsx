import { useMemo } from 'react';
import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AiAssistant, LearningScoreCard, ProgressPredictionCard, DailyGoalCard, StudyPlanner, RecommendationCard, WeakTopicCard } from '@/components/ai';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import { useLearningInsights } from '@/hooks/useLearningInsights';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useCurrentUser } from '@/hooks/useProfile';


export function AiDashboardPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { analytics, prediction, studyPlan, loading } = useAiAssistant(studentId);
  const { insights } = useLearningInsights(studentId);
  const { dailyGoal } = useDailyGoals(studentId);
  const { recommendations } = useRecommendations(studentId);

  const topRecommendations = useMemo(() => recommendations.slice(0, 4), [recommendations]);
  const weakTopics = useMemo(() => studyPlan?.weakTopics ?? [], [studyPlan]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><Sparkles className="h-5 w-5 text-primary-500" /> AI Learning Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">Your personalized AI-powered learning insights and recommendations</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading your AI dashboard...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <LearningScoreCard analytics={analytics} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ProgressPredictionCard prediction={prediction} />
              <DailyGoalCard goal={dailyGoal} />
            </div>
            {studyPlan && (
              <StudyPlanner
                dailyTargets={studyPlan.targets}
                dailyGoal={dailyGoal}
                estimatedMinutes={studyPlan.estimatedMinutes}
                focus={studyPlan.focus}
              />
            )}
            {topRecommendations.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary-500" /> Recommended For You</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {topRecommendations.map((rec) => <RecommendationCard key={rec.id} recommendation={rec} />)}
                  </div>
                </CardContent>
              </Card>
            )}
            {weakTopics.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Weak Topics</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {weakTopics.map((topic) => <WeakTopicCard key={topic.id} topic={topic} />)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-1">
            <AiAssistant insights={insights} learningScore={analytics?.learningScore} />
          </div>
        </div>
      )}
    </div>
  );
}
