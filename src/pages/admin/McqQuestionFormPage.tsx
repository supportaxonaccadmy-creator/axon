import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { mcqService } from '@/services/lms/mcqService';
import type { McqQuestion, McqCorrectOption } from '@/types/lms';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { McqQuestionEditor, type McqQuestionFormData, type McqQuestionFormErrors } from '@/components/admin/mcq';
import type { LmsStatus } from '@/types/lms';

interface McqQuestionFormPageProps { mode: 'create' | 'edit'; }

export function McqQuestionFormPage({ mode }: McqQuestionFormPageProps) {
  const navigate = useNavigate();
  const { id, questionId } = useParams<{ id: string; questionId: string }>();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<McqQuestionFormErrors>({});
  const [form, setForm] = useState<McqQuestionFormData>({
    question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'a' as McqCorrectOption,
    explanation: '', marks: 1, negativeMarks: 0, status: 'draft' as LmsStatus, sortOrder: 0,
  });

  useEffect(() => {
    if (mode === 'edit' && questionId) {
      setLoading(true);
      mcqService.getQuestionById(questionId).then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? 'Question not found'); setLoading(false); return; }
        const q = data as McqQuestion;
        setForm({ question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD, correctOption: q.correctOption, explanation: q.explanation ?? '', marks: q.marks, negativeMarks: q.negativeMarks, status: q.status, sortOrder: q.sortOrder });
        setLoading(false);
      });
    } else if (mode === 'create' && id) {
      mcqService.listQuestions(id).then(({ data }) => {
        setForm((f) => ({ ...f, sortOrder: (data?.length ?? 0) }));
      });
    }
  }, [mode, questionId, id]);

  const validate = useCallback((): boolean => {
    const errs: McqQuestionFormErrors = {};
    if (!form.question.trim()) errs.question = 'Question is required';
    if (!form.optionA.trim()) errs.optionA = 'Option A is required';
    if (!form.optionB.trim()) errs.optionB = 'Option B is required';
    if (form.marks < 0) errs.marks = 'Marks must be positive';
    if (form.negativeMarks < 0) errs.negativeMarks = 'Negative marks must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!validate() || !id) return;
    setSaving(true);
    const payload = { mcqSetId: id, question: form.question.trim(), optionA: form.optionA.trim(), optionB: form.optionB.trim(), optionC: form.optionC.trim(), optionD: form.optionD.trim(), correctOption: form.correctOption, explanation: form.explanation.trim() || null, marks: Number(form.marks), negativeMarks: Number(form.negativeMarks), sortOrder: Number(form.sortOrder), status: form.status };
    const result = mode === 'create' ? await mcqService.createQuestion(payload) : await mcqService.updateQuestion(questionId!, payload);
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    navigate(`/admin/mcq/${id}`);
  }, [form, id, questionId, mode, navigate, validate]);

  if (loading) return <div className="h-96 rounded-xl border border-neutral-200 bg-white animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(id ? `/admin/mcq/${id}` : '/admin/mcq')}><ArrowLeft className="h-4 w-4" /></Button>
        <h1 className="text-2xl font-bold text-neutral-900">{mode === 'create' ? 'New Question' : 'Edit Question'}</h1>
      </div>
      {error && <Alert variant="error" title="Error">{error}</Alert>}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <McqQuestionEditor form={form} onFormChange={(field, value) => setForm((f) => ({ ...f, [field]: value as never }))} errors={errors} generalError={null} />
        <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(id ? `/admin/mcq/${id}` : '/admin/mcq')}>Cancel</Button>
          <Button type="submit" loading={saving}><Save className="h-4 w-4" />{mode === 'create' ? 'Create Question' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  );
}
