import { memo } from 'react';
import { Sparkles, TrendingUp, Clock, Target } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { getScoreColor, formatMinutes } from '@/services/ai';
import type { LearningAnalytics } from '@/services/ai';

interface LearningScoreCardProps {
  analytics: LearningAnalytics | null;
  className?: string | undefined;
}

function LearningScoreCardComponent({ analytics, className }: LearningScoreCardProps) {
  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="h-8 w-8 text-neutral-300" />
          <p className="mt-2 text-sm text-neutral-500">No analytics available yet</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    { label: 'Learning Score', value: analytics.learningScore.toFixed(1), icon: Sparkles, color: 'text-primary-500', scoreBased: true, score: analytics.learningScore },
    { label: 'Consistency', value: `${analytics.consistencyScore.toFixed(0)}%`, icon: Target, color: 'text-blue-500' },
    { label: 'Study Time', value: formatMinutes(analytics.totalStudyMinutes), icon: Clock, color: 'text-green-500' },
    { label: 'Avg Session', value: formatMinutes(analytics.avgSessionDuration), icon: TrendingUp, color: 'text-orange-500' },
  ];

  return (
    <Card hover className={className}>
      <CardContent className="p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Sparkles className="h-4 w-4 text-primary-500" /> Learning Analytics
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border border-neutral-100 p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <Icon className={cn('h-3.5 w-3.5', stat.color)} />
                  <span className="text-[11px] text-neutral-400">{stat.label}</span>
                </div>
                <p className={cn('text-lg font-bold', stat.scoreBased ? getScoreColor(stat.score ?? 0) : 'text-neutral-900')}>{stat.value}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-400">This Week</span><span className="font-medium text-neutral-700">{formatMinutes(analytics.weeklyProgress)}</span></div>
            <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-400">This Month</span><span className="font-medium text-neutral-700">{formatMinutes(analytics.monthlyProgress)}</span></div>
            <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-400">Sessions</span><span className="font-medium text-neutral-700">{analytics.sessionCount}</span></div>
            <div className="flex items-center justify-between rounded-md bg-neutral-50 px-2 py-1.5"><span className="text-neutral-400">Study Days</span><span className="font-medium text-neutral-700">{analytics.studyDaysThisWeek}/7</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const LearningScoreCard = memo(LearningScoreCardComponent);
