import { memo } from 'react';
import { Target, Clock, HelpCircle, Video } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { getProgressPercentage, formatMinutes } from '@/services/ai';
import type { StudyGoal } from '@/services/ai';

interface DailyGoalCardProps {
  goal: StudyGoal | null;
  className?: string | undefined;
}

function DailyGoalCardComponent({ goal, className }: DailyGoalCardProps) {
  if (!goal) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Target className="h-8 w-8 text-neutral-300" />
          <p className="mt-2 text-sm text-neutral-500">No daily goal set</p>
        </CardContent>
      </Card>
    );
  }

  const minutesProgress = getProgressPercentage(goal.achievedMinutes, goal.targetMinutes);
  const mcqsProgress = getProgressPercentage(goal.achievedMcqs, goal.targetMcqs);
  const videosProgress = getProgressPercentage(goal.achievedVideos, goal.targetVideos);

  const goals = [
    { label: 'Study Time', icon: Clock, achieved: formatMinutes(goal.achievedMinutes), target: formatMinutes(goal.targetMinutes), progress: minutesProgress, color: 'bg-primary-500' },
    { label: 'MCQs', icon: HelpCircle, achieved: String(goal.achievedMcqs), target: String(goal.targetMcqs), progress: mcqsProgress, color: 'bg-blue-500' },
    { label: 'Videos', icon: Video, achieved: String(goal.achievedVideos), target: String(goal.targetVideos), progress: videosProgress, color: 'bg-green-500' },
  ];

  return (
    <Card hover className={className}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary-500" />
          <h3 className="text-sm font-semibold text-neutral-900">Daily Goals</h3>
        </div>
        <div className="space-y-3">
          {goals.map((g) => {
            const Icon = g.icon;
            return (
              <div key={g.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-neutral-500"><Icon className="h-3.5 w-3.5" /> {g.label}</span>
                  <span className="font-medium text-neutral-700">{g.achieved}/{g.target}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div className={cn('h-full rounded-full transition-all', g.color)} style={{ width: `${g.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export const DailyGoalCard = memo(DailyGoalCardComponent);
