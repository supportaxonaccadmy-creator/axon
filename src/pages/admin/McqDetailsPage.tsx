import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, Archive, RotateCcw, Trash2, CheckCircle2, EyeOff, Plus, Calendar, Hash, Clock, Award, Play } from 'lucide-react';
import { mcqService } from '@/services/lms/mcqService';
import { classService } from '@/services/lms/classService';
import type { McqSet, Class, McqQuestion } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { ContentStatusBadge } from '@/components/admin/content';
import { ConfirmDialog } from '@/components/admin/common';
import { McqStatistics, McqQuestionCard, McqPreview, McqImportExport } from '@/components/admin/mcq';
import { useAdminMcqQuestions } from '@/hooks/useAdminMcq';
import { format } from 'date-fns';
import type { LmsStatus } from '@/types/lms';

type Tab = 'questions' | 'preview' | 'import-export';

export function McqDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mcqSet, setMcqSet] = useState<McqSet | null>(null);
  const [cls, setCls] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('questions');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [confirmQuestionDelete, setConfirmQuestionDelete] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const { questions, stats, refresh: refreshQuestions } = useAdminMcqQuestions(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    mcqService.getSetById(id).then(async ({ data, error: err }) => {
      if (err || !data) { setError(err ?? 'MCQ set not found'); setLoading(false); return; }
      setMcqSet(data as McqSet);
      const { data: clsData } = await classService.getById((data as McqSet).classId);
      if (clsData) setCls(clsData as Class);
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (newStatus: LmsStatus) => { if (!id) return; setActionLoading(true); await mcqService.updateSet(id, { status: newStatus }); setActionLoading(false); setMcqSet((s) => s ? { ...s, status: newStatus } : s); };
  const handleDuplicate = async () => { if (!mcqSet) return; setActionLoading(true); await mcqService.createSet({ classId: mcqSet.classId, title: `${mcqSet.title} (Copy)`, slug: `${mcqSet.slug}-copy-${Date.now().toString(36)}`, description: mcqSet.description, instructions: mcqSet.instructions, durationMinutes: mcqSet.durationMinutes, totalMarks: mcqSet.totalMarks, passingMarks: mcqSet.passingMarks, attemptsAllowed: mcqSet.attemptsAllowed, shuffleQuestions: mcqSet.shuffleQuestions, showResult: mcqSet.showResult, sortOrder: mcqSet.sortOrder + 1, status: 'draft' }); setActionLoading(false); navigate('/admin/mcq'); };
  const handleDelete = async () => { if (!id) return; setActionLoading(true); await mcqService.removeSet(id); setActionLoading(false); navigate('/admin/mcq'); };

  const toggleQuestionSelect = useCallback((qid: string) => { setSelectedQuestions((prev) => { const n = new Set(prev); if (n.has(qid)) n.delete(qid); else n.add(qid); return n; }); }, []);

  const handleQuestionMove = useCallback(async (qid: string, dir: 'up' | 'down') => {
    const idx = questions.findIndex((q) => q.id === qid);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= questions.length) return;
    const swap = questions[swapIdx]!;
    await Promise.all([mcqService.updateQuestionSortOrder(qid, swap.sortOrder), mcqService.updateQuestionSortOrder(swap.id, questions[idx]!.sortOrder)]);
    refreshQuestions();
  }, [questions, refreshQuestions]);

  const handleQuestionDuplicate = useCallback(async (qid: string) => {
    const q = questions.find((x) => x.id === qid);
    if (!q || !id) return;
    await mcqService.createQuestion({ mcqSetId: id, question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption, explanation: q.explanation, marks: q.marks, negativeMarks: q.negativeMarks, sortOrder: q.sortOrder + 1, status: 'draft' });
    refreshQuestions();
  }, [questions, id, refreshQuestions]);

  const handleQuestionDelete = useCallback(async () => {
    if (!confirmQuestionDelete) return;
    await mcqService.removeQuestion(confirmQuestionDelete);
    setConfirmQuestionDelete(null);
    refreshQuestions();
  }, [confirmQuestionDelete, refreshQuestions]);

  const handleBulkDelete = useCallback(async () => {
    setActionLoading(true);
    await Promise.all(Array.from(selectedQuestions).map((qid) => mcqService.removeQuestion(qid)));
    setActionLoading(false);
    setConfirmBulkDelete(false);
    setSelectedQuestions(new Set());
    refreshQuestions();
  }, [selectedQuestions, refreshQuestions]);

  const handleImport = useCallback(async (imported: McqQuestion[]) => {
    if (!id) return;
    setActionLoading(true);
    for (const q of imported) {
      await mcqService.createQuestion({ mcqSetId: id, question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption, explanation: q.explanation, marks: q.marks, negativeMarks: q.negativeMarks, sortOrder: q.sortOrder, status: q.status });
    }
    setActionLoading(false);
    refreshQuestions();
  }, [id, refreshQuestions]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;
  if (error || !mcqSet) return <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">{error ?? 'MCQ set not found'}</div>;

  const tabs: Array<{ key: Tab; label: string; icon: typeof Plus }> = [
    { key: 'questions', label: 'Questions', icon: Plus },
    { key: 'preview', label: 'Preview', icon: Play },
    { key: 'import-export', label: 'Import / Export', icon: Award },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/mcq')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mcqSet.title}</h1>
        <ContentStatusBadge status={mcqSet.status} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/mcq/${mcqSet.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit</Button>
        <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={actionLoading}><Copy className="h-3.5 w-3.5" />Duplicate</Button>
        {mcqSet.status === 'published' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><EyeOff className="h-3.5 w-3.5" />Unpublish</Button>
        : mcqSet.status === 'archived' ? <Button variant="outline" size="sm" onClick={() => handleStatusChange('draft')} disabled={actionLoading}><RotateCcw className="h-3.5 w-3.5" />Restore</Button>
        : <Button variant="success" size="sm" onClick={() => handleStatusChange('published')} disabled={actionLoading}><CheckCircle2 className="h-3.5 w-3.5" />Publish</Button>}
        {mcqSet.status !== 'archived' && <Button variant="outline" size="sm" onClick={() => handleStatusChange('archived')} disabled={actionLoading}><Archive className="h-3.5 w-3.5" />Archive</Button>}
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} disabled={actionLoading}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">MCQ Set Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3"><Hash className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Slug:</span><span className="font-mono text-sm text-neutral-900">/{mcqSet.slug}</span></div>
              {mcqSet.description && <div className="flex items-start gap-3"><Edit className="mt-0.5 h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Description:</span><span className="text-sm text-neutral-900">{mcqSet.description}</span></div>}
              {cls && <div className="flex items-center gap-3"><Edit className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Class:</span><span className="text-sm font-medium text-neutral-900">{cls.title}</span></div>}
              {mcqSet.durationMinutes && <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Duration:</span><span className="text-sm text-neutral-900">{mcqSet.durationMinutes} minutes</span></div>}
              <div className="flex items-center gap-3"><Award className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Total/Passing:</span><span className="text-sm text-neutral-900">{mcqSet.totalMarks} / {mcqSet.passingMarks} marks</span></div>
              <div className="flex items-center gap-3"><Calendar className="h-4 w-4 text-neutral-400" /><span className="text-sm text-neutral-500">Created:</span><span className="text-sm text-neutral-900">{format(new Date(mcqSet.createdAt), 'MMM d, yyyy h:mm a')}</span></div>
            </div>
          </div>

          <div className="flex gap-2 border-b border-neutral-200">
            {tabs.map((t) => { const Icon = t.icon; return (
              <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}>
                <Icon className="h-3.5 w-3.5" />{t.label}
              </button>
            ); })}
          </div>

          {tab === 'questions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-800">Questions ({questions.length})</h3>
                <div className="flex items-center gap-2">
                  {selectedQuestions.size > 0 && <Button size="sm" variant="danger" onClick={() => setConfirmBulkDelete(true)}><Trash2 className="h-3.5 w-3.5" />Delete Selected ({selectedQuestions.size})</Button>}
                  <Button size="sm" onClick={() => navigate(`/admin/mcq/${mcqSet.id}/questions/new`)}><Plus className="h-3.5 w-3.5" />Add Question</Button>
                </div>
              </div>
              <McqStatistics stats={stats} loading={false} />
              {questions.length === 0 ? (
                <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
                  <p className="text-sm text-neutral-500">No questions yet. Add your first question or import from CSV/JSON.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <McqQuestionCard key={q.id} question={q} index={idx} total={questions.length} selected={selectedQuestions.has(q.id)} onToggleSelect={toggleQuestionSelect} onEdit={(qid) => navigate(`/admin/mcq/${mcqSet.id}/questions/${qid}/edit`)} onDuplicate={handleQuestionDuplicate} onDelete={setConfirmQuestionDelete} onMoveUp={(qid) => handleQuestionMove(qid, 'up')} onMoveDown={(qid) => handleQuestionMove(qid, 'down')} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'preview' && <McqPreview questions={questions} />}

          {tab === 'import-export' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800">Import / Export Questions</h3>
              <McqImportExport questions={questions} onImport={handleImport} />
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                <p className="font-medium text-neutral-800">Import Guidelines:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>CSV: First row must be headers. Required: question, optionA, optionB, optionC, optionD, correctOption</li>
                  <li>JSON: Array of objects with the same fields</li>
                  <li>correctOption must be one of: a, b, c, d</li>
                  <li>Download sample files to see the expected format</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-neutral-800">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/admin/mcq/${mcqSet.id}/edit`)}><Edit className="h-3.5 w-3.5" />Edit Set</Button>
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(`/admin/mcq/${mcqSet.id}/questions/new`)}><Plus className="h-3.5 w-3.5" />Add Question</Button>
              <Button variant="outline" size="sm" fullWidth onClick={() => setTab('preview')}><Play className="h-3.5 w-3.5" />Preview Quiz</Button>
              <Button variant="outline" size="sm" fullWidth onClick={() => setTab('import-export')}><Award className="h-3.5 w-3.5" />Import / Export</Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} title="Delete MCQ Set" message="Are you sure you want to delete this MCQ set and all its questions? This cannot be undone." confirmLabel="Delete" loading={actionLoading} />
      <ConfirmDialog open={!!confirmQuestionDelete} onClose={() => setConfirmQuestionDelete(null)} onConfirm={handleQuestionDelete} title="Delete Question" message="Are you sure you want to delete this question?" confirmLabel="Delete" loading={false} />
      <ConfirmDialog open={confirmBulkDelete} onClose={() => setConfirmBulkDelete(false)} onConfirm={handleBulkDelete} title="Delete Selected Questions" message={`Are you sure you want to delete ${selectedQuestions.size} question(s)?`} confirmLabel="Delete All" loading={actionLoading} variant="danger" />
    </div>
  );
}
