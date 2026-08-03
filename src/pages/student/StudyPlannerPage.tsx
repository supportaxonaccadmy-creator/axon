import { useMemo } from 'react';
import { Calendar, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StudyPlanner, DailyGoalCard } from '@/components/ai';
import { useStudyPlanner } from '@/hooks/useStudyPlanner';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import { useCurrentUser } from '@/hooks/useProfile';
import { formatMinutes } from '@/services/ai';

export function StudyPlannerPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { goals, dailyTargets, loading } = useStudyPlanner(studentId);
  const { dailyGoal, weeklyGoal } = useDailyGoals(studentId);
  const { studyPlan } = useAiAssistant(studentId);

  const targets = useMemo(() => dailyTargets.length > 0 ? dailyTargets : studyPlan?.targets ?? [], [dailyTargets, studyPlan]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900"><Calendar className="h-5 w-5 text-primary-500" /> Study Planner</h1>
        <p className="mt-1 text-sm text-neutral-500">Plan your daily and weekly study goals with AI assistance</p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading your study plan...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <StudyPlanner
              dailyTargets={targets}
              dailyGoal={dailyGoal}
              estimatedMinutes={studyPlan?.estimatedMinutes ?? 0}
              focus={studyPlan?.focus}
            />
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-4 w-4 text-primary-500" /> Weekly Goal</CardTitle></CardHeader>
              <CardContent>
                {weeklyGoal ? (
                  <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-lg font-bold text-neutral-900">{weeklyGoal.achievedMinutes}/{weeklyGoal.targetMinutes}m</p><p className="text-xs text-neutral-400">Study Time</p></div>
                    <div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-lg font-bold text-neutral-900">{weeklyGoal.achievedMcqs}/{weeklyGoal.targetMcqs}</p><p className="text-xs text-neutral-400">MCQs</p></div>
                    <div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-lg font-bold text-neutral-900">{weeklyGoal.achievedVideos}/{weeklyGoal.targetVideos}</p><p className="text-xs text-neutral-400">Videos</p></div>
                    <div className="rounded-lg bg-neutral-50 p-3 text-center"><p className="text-lg font-bold text-neutral-900">{weeklyGoal.achievedChapters}/{weeklyGoal.targetChapters}</p><p className="text-xs text-neutral-400">Chapters</p></div>
                  </div>
                ) : (
                  <p className="py-4 text-center text-sm text-neutral-500">No weekly goal set. Create one to track your weekly progress!</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <DailyGoalCard goal={dailyGoal} />
            <Card className="mt-4">
              <CardContent className="p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900"><Clock className="h-4 w-4 text-primary-500" /> Study Stats</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"><span className="text-neutral-400">Active Goals</span><span className="font-medium text-neutral-700">{goals.length}</span></div>
                  <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"><span className="text-neutral-400">Daily Targets</span><span className="font-medium text-neutral-700">{targets.length}</span></div>
                  <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"><span className="text-neutral-400">Completed Today</span><span className="font-medium text-neutral-700">{targets.filter((t) => t.isCompleted).length}</span></div>
                  <div className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2"><span className="text-neutral-400">Est. Time</span><span className="font-medium text-neutral-700">{formatMinutes(studyPlan?.estimatedMinutes ?? 0)}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
