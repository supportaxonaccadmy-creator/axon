import { memo } from 'react';
import { CheckCircle2, XCircle, MinusCircle, Clock, Award } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { McqAttemptResult } from '@/types/mcqPractice';

interface McqResultSummaryProps { result: McqAttemptResult; }

function McqResultSummaryComponent({ result }: McqResultSummaryProps) {
  const formatTime = (seconds: number) => { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}m ${s}s`; };
  const stats = [
    { label: 'Correct', value: result.correctAnswers, icon: CheckCircle2, color: 'text-success-600 bg-success-50' },
    { label: 'Incorrect', value: result.incorrectAnswers, icon: XCircle, color: 'text-error-600 bg-error-50' },
    { label: 'Skipped', value: result.skippedQuestions, icon: MinusCircle, color: 'text-warning-600 bg-warning-50' },
    { label: 'Time Taken', value: formatTime(result.timeTakenSeconds), icon: Clock, color: 'text-primary-600 bg-primary-50' },
  ];
  return (
    <div className="space-y-6">
      <div className={cn('flex flex-col items-center gap-4 rounded-xl border px-6 py-8 text-center shadow-sm', result.hasPassed ? 'border-success-200 bg-success-50' : 'border-error-200 bg-error-50')}>
        <div className={cn('flex h-20 w-20 items-center justify-center rounded-full', result.hasPassed ? 'bg-success-500' : 'bg-error-500')}>{result.hasPassed ? <Award className="h-10 w-10 text-white" /> : <XCircle className="h-10 w-10 text-white" />}</div>
        <div><p className={cn('text-2xl font-bold', result.hasPassed ? 'text-success-700' : 'text-error-700')}>{result.hasPassed ? 'Passed!' : 'Not Passed'}</p><p className="mt-1 text-sm text-neutral-500">{result.hasPassed ? 'Congratulations on completing the test.' : 'Keep practicing to improve your score.'}</p></div>
        <div className="flex items-center gap-6">
          <div className="text-center"><p className="text-3xl font-bold text-neutral-900">{result.percentage}%</p><p className="text-xs text-neutral-500">Score</p></div>
          <div className="h-10 w-px bg-neutral-200" />
          <div className="text-center"><p className="text-3xl font-bold text-neutral-900">{result.obtainedMarks}/{result.totalMarks}</p><p className="text-xs text-neutral-500">Marks</p></div>
          <div className="h-10 w-px bg-neutral-200" />
          <div className="text-center"><p className="text-3xl font-bold text-neutral-900">{result.passingMarks}</p><p className="text-xs text-neutral-500">Passing</p></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"><div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.color)}><Icon className="h-5 w-5" strokeWidth={2} /></div><div><p className="text-xl font-bold text-neutral-900">{stat.value}</p><p className="text-xs text-neutral-500">{stat.label}</p></div></div>; })}
      </div>
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-800">Performance Breakdown</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3"><span className="w-20 text-xs text-neutral-500">Correct</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-success-500" style={{ width: `${(result.correctAnswers / result.totalQuestions) * 100}%` }} /></div><span className="w-8 text-right text-xs font-medium text-neutral-700">{result.correctAnswers}</span></div>
          <div className="flex items-center gap-3"><span className="w-20 text-xs text-neutral-500">Incorrect</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-error-500" style={{ width: `${(result.incorrectAnswers / result.totalQuestions) * 100}%` }} /></div><span className="w-8 text-right text-xs font-medium text-neutral-700">{result.incorrectAnswers}</span></div>
          <div className="flex items-center gap-3"><span className="w-20 text-xs text-neutral-500">Skipped</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-warning-500" style={{ width: `${(result.skippedQuestions / result.totalQuestions) * 100}%` }} /></div><span className="w-8 text-right text-xs font-medium text-neutral-700">{result.skippedQuestions}</span></div>
        </div>
      </div>
    </div>
  );
}

export const McqResultSummary = memo(McqResultSummaryComponent);
