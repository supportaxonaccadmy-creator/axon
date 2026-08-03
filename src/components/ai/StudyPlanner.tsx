import { memo } from 'react';
import { Calendar, Clock, Target, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DAILY_TARGET_TYPE_LABELS, formatMinutes, getProgressPercentage } from '@/services/ai';
import type { DailyTarget, StudyGoal } from '@/services/ai';

interface StudyPlannerProps {
  dailyTargets: DailyTarget[];
  dailyGoal?: StudyGoal | null | undefined;
  estimatedMinutes?: number | undefined;
  focus?: string | undefined;
  className?: string | undefined;
}

function StudyPlannerComponent({ dailyTargets, dailyGoal, estimatedMinutes = 0, focus, className }: StudyPlannerProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary-500" /> Today's Study Plan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {focus && (
            <div className="rounded-lg bg-primary-50 p-3">
              <p className="text-xs text-primary-600">Today's Focus</p>
              <p className="text-sm font-medium text-primary-800">{focus}</p>
            </div>
          )}
          {estimatedMinutes > 0 && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Clock className="h-3.5 w-3.5" /> Estimated time: {formatMinutes(estimatedMinutes)}
            </div>
          )}
          {dailyTargets.length === 0 ? (
            <p className="py-4 text-center text-sm text-neutral-500">No targets set for today</p>
          ) : (
            <div className="space-y-2">
              {dailyTargets.map((target) => {
                const progress = getProgressPercentage(target.completedCount, target.targetCount);
                return (
                  <div key={target.id} className="rounded-lg border border-neutral-100 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {target.isCompleted ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Target className="h-4 w-4 text-neutral-400" />}
                        <span className="text-sm font-medium text-neutral-700">{DAILY_TARGET_TYPE_LABELS[target.targetType]}</span>
                      </div>
                      <span className="text-xs text-neutral-400">{target.completedCount}/{target.targetCount}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div className={cn('h-full rounded-full transition-all', target.isCompleted ? 'bg-green-500' : 'bg-primary-500')} style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {dailyGoal && (
            <div className="border-t border-neutral-100 pt-3">
              <p className="mb-2 text-xs font-medium text-neutral-500">Daily Goal Progress</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-500">Minutes</span><span className="font-medium text-neutral-700">{dailyGoal.achievedMinutes}/{dailyGoal.targetMinutes}</span></div>
                <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-500">MCQs</span><span className="font-medium text-neutral-700">{dailyGoal.achievedMcqs}/{dailyGoal.targetMcqs}</span></div>
                <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-500">Videos</span><span className="font-medium text-neutral-700">{dailyGoal.achievedVideos}/{dailyGoal.targetVideos}</span></div>
                <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-500">Chapters</span><span className="font-medium text-neutral-700">{dailyGoal.achievedChapters}/{dailyGoal.targetChapters}</span></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const StudyPlanner = memo(StudyPlannerComponent);
