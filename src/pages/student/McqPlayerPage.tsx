import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, BookOpen, Clock, ListChecks } from 'lucide-react';
import { useMcqPlayer } from '@/hooks/useMcqPlayer';
import { McqTimer } from '@/components/student/mcq/McqTimer';
import { McqQuestionView } from '@/components/student/mcq/McqQuestionView';
import { McqQuestionPalette } from '@/components/student/mcq/McqQuestionPalette';
import { DashboardLoadingSkeleton } from '@/components/student/dashboard/LoadingSkeleton';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export function McqPlayerPage() {
  const { setSlug } = useParams<{ setSlug: string }>();
  const navigate = useNavigate();
  const { set, questions, currentIndex, answers, markedQuestions, visitedQuestions, timeRemainingSeconds, totalDurationSeconds, loading, error, submitted, selectAnswer, clearAnswer, toggleMark, goToQuestion, nextQuestion, previousQuestion, tickTimer, submitAttempt, refresh } = useMcqPlayer(setSlug);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  if (loading) return <DashboardLoadingSkeleton />;
  if (error || !set) { return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3"><p className="text-sm text-error-700">{error ?? 'MCQ set not found'}</p><button onClick={refresh} className="mt-2 text-xs text-primary-600 font-medium hover:underline">Retry</button></div>; }
  if (submitted) { navigate(`/student/mcq/${setSlug}/result`, { replace: true, state: { result: null } }); return null; }
  if (questions.length === 0) { return <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center"><BookOpen className="h-10 w-10 text-neutral-400" /><div><p className="text-base font-semibold text-neutral-800">No questions available</p><p className="mt-1 text-sm text-neutral-500">This test does not have any published questions yet.</p></div><Button variant="outline" size="sm" onClick={() => navigate('/student/mcq')}>Back to Tests</Button></div>; }

  const currentQuestion = questions[currentIndex]!;
  const answeredCount = questions.filter((q) => answers[q.id] !== null && answers[q.id] !== undefined).length;
  const markedCount = markedQuestions.size;

  if (showInstructions) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50"><ListChecks className="h-6 w-6 text-primary-600" strokeWidth={2} /></div><div className="min-w-0"><h1 className="text-xl font-bold text-neutral-900">{set.title}</h1><p className="mt-1 text-sm text-neutral-500">{set.description ?? 'Test your knowledge with this practice test.'}</p></div></div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><ListChecks className="h-5 w-5 text-primary-600" /><div><p className="text-lg font-bold text-neutral-900">{questions.length}</p><p className="text-xs text-neutral-500">Questions</p></div></div>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><Clock className="h-5 w-5 text-accent-600" /><div><p className="text-lg font-bold text-neutral-900">{set.durationMinutes ?? 0} min</p><p className="text-xs text-neutral-500">Duration</p></div></div>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><BookOpen className="h-5 w-5 text-success-600" /><div><p className="text-lg font-bold text-neutral-900">{set.totalMarks}</p><p className="text-xs text-neutral-500">Total Marks</p></div></div>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"><AlertCircle className="h-5 w-5 text-warning-600" /><div><p className="text-lg font-bold text-neutral-900">{set.passingMarks}</p><p className="text-xs text-neutral-500">Passing</p></div></div>
        </div>
        {set.instructions && <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"><h3 className="text-sm font-semibold text-neutral-800">Instructions</h3><p className="mt-2 text-sm text-neutral-600 leading-relaxed">{set.instructions}</p></div>}
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-4"><div className="flex items-start gap-2"><AlertCircle className="h-4 w-4 shrink-0 text-warning-600 mt-0.5" /><p className="text-sm text-warning-700">Once you start the test, the timer will begin and cannot be paused. Make sure you have a stable internet connection.</p></div></div>
        <div className="flex justify-center gap-3"><Button variant="outline" onClick={() => navigate('/student/mcq')}>Cancel</Button><Button variant="primary" onClick={() => setShowInstructions(false)}>Start Test</Button></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><h1 className="text-lg font-bold text-neutral-900">{set.title}</h1><span className="text-xs text-neutral-400">{answeredCount} answered | {markedCount} marked | {questions.length - answeredCount} remaining</span></div>
        <McqTimer timeRemainingSeconds={timeRemainingSeconds} totalDurationSeconds={totalDurationSeconds} onTick={tickTimer} onExpire={submitAttempt} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3"><McqQuestionView question={currentQuestion} questionNumber={currentIndex + 1} totalQuestions={questions.length} selectedOption={answers[currentQuestion.id] ?? null} isMarked={markedQuestions.has(currentQuestion.id)} onSelect={(opt) => selectAnswer(currentQuestion.id, opt)} onClear={() => clearAnswer(currentQuestion.id)} onToggleMark={() => toggleMark(currentQuestion.id)} onNext={nextQuestion} onPrevious={previousQuestion} onSubmit={() => setShowSubmitConfirm(true)} isFirst={currentIndex === 0} isLast={currentIndex === questions.length - 1} /></div>
        <div className="lg:col-span-1"><McqQuestionPalette questions={questions} currentIndex={currentIndex} answers={answers} markedQuestions={markedQuestions} visitedQuestions={visitedQuestions} onJump={goToQuestion} /><div className="mt-4"><Button variant="success" fullWidth onClick={() => setShowSubmitConfirm(true)}>Submit Test</Button></div></div>
      </div>
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in" onClick={() => setShowSubmitConfirm(false)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-neutral-900">Submit Test?</h3>
            <p className="mt-2 text-sm text-neutral-500">You have answered {answeredCount} out of {questions.length} questions.{questions.length - answeredCount > 0 && ` ${questions.length - answeredCount} questions will be marked as skipped.`}</p>
            <div className="mt-4 flex justify-end gap-3"><Button variant="outline" size="sm" onClick={() => setShowSubmitConfirm(false)}>Cancel</Button><Button variant="success" size="sm" onClick={() => { setShowSubmitConfirm(false); submitAttempt(); }}>Submit</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
