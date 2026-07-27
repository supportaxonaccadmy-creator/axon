import { memo, useCallback } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { McqQuestion } from '@/types/lms';

interface McqImportExportProps {
  questions: McqQuestion[];
  onImport: (data: McqQuestion[], format: 'csv' | 'json') => void;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(questions: McqQuestion[]): string {
  const headers = ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctOption', 'explanation', 'marks', 'negativeMarks', 'status', 'sortOrder'];
  const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;
  const rows = questions.map((q) => [
    escapeCSV(q.question), escapeCSV(q.optionA), escapeCSV(q.optionB), escapeCSV(q.optionC), escapeCSV(q.optionD),
    q.correctOption, escapeCSV(q.explanation ?? ''), q.marks, q.negativeMarks, q.status, q.sortOrder,
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}

function toJSON(questions: McqQuestion[]): string {
  return JSON.stringify(questions.map((q) => ({
    question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
    correctOption: q.correctOption, explanation: q.explanation, marks: q.marks, negativeMarks: q.negativeMarks,
    status: q.status, sortOrder: q.sortOrder,
  })), null, 2);
}

const SAMPLE_CSV = `question,optionA,optionB,optionC,optionD,correctOption,explanation,marks,negativeMarks,status,sortOrder
"What is the capital of India?","Mumbai","New Delhi","Kolkata","Chennai","b","New Delhi is the capital of India",1,0,published,1
"Which planet is closest to the Sun?","Venus","Earth","Mercury","Mars","c","Mercury is the closest planet to the Sun",1,0.25,published,2`;

const SAMPLE_JSON = JSON.stringify([
  { question: 'What is the capital of India?', optionA: 'Mumbai', optionB: 'New Delhi', optionC: 'Kolkata', optionD: 'Chennai', correctOption: 'b', explanation: 'New Delhi is the capital of India', marks: 1, negativeMarks: 0, status: 'published', sortOrder: 1 },
  { question: 'Which planet is closest to the Sun?', optionA: 'Venus', optionB: 'Earth', optionC: 'Mercury', optionD: 'Mars', correctOption: 'c', explanation: 'Mercury is the closest planet to the Sun', marks: 1, negativeMarks: 0.25, status: 'published', sortOrder: 2 },
], null, 2);

function McqImportExportComponent({ questions, onImport }: McqImportExportProps) {
  const handleExportCSV = useCallback(() => {
    downloadFile(toCSV(questions), 'mcq-questions.csv', 'text/csv');
  }, [questions]);

  const handleExportJSON = useCallback(() => {
    downloadFile(toJSON(questions), 'mcq-questions.json', 'application/json');
  }, [questions]);

  const handleDownloadSampleCSV = useCallback(() => {
    downloadFile(SAMPLE_CSV, 'sample-mcq-import.csv', 'text/csv');
  }, []);

  const handleDownloadSampleJSON = useCallback(() => {
    downloadFile(SAMPLE_JSON, 'sample-mcq-import.json', 'application/json');
  }, []);

  const handleImport = useCallback((format: 'csv' | 'json') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = format === 'csv' ? '.csv' : '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        try {
          if (format === 'json') {
            const data = JSON.parse(text) as McqQuestion[];
            onImport(data, 'json');
          } else {
            const lines = text.split('\n').filter((l) => l.trim());
            const headers = lines[0]!.split(',').map((h) => h.replace(/"/g, ''));
            const parsed: McqQuestion[] = lines.slice(1).map((line) => {
              const values: string[] = [];
              let current = '';
              let inQuotes = false;
              for (const ch of line) {
                if (ch === '"') inQuotes = !inQuotes;
                else if (ch === ',' && !inQuotes) { values.push(current); current = ''; }
                else current += ch;
              }
              values.push(current);
              const obj: Record<string, string> = {};
              headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
              return {
                id: '', mcqSetId: '', question: obj.question ?? '', optionA: obj.optionA ?? '', optionB: obj.optionB ?? '',
                optionC: obj.optionC ?? '', optionD: obj.optionD ?? '', correctOption: (obj.correctOption ?? 'a') as McqQuestion['correctOption'],
                explanation: obj.explanation ?? null, marks: Number(obj.marks) || 1, negativeMarks: Number(obj.negativeMarks) || 0,
                sortOrder: Number(obj.sortOrder) || 0, status: (obj.status ?? 'draft') as McqQuestion['status'],
                createdAt: '', updatedAt: '',
              };
            });
            onImport(parsed, 'csv');
          }
        } catch {
          alert('Failed to parse file. Please check the format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [onImport]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={questions.length === 0}><FileSpreadsheet className="h-3.5 w-3.5" />Export CSV</Button>
      <Button size="sm" variant="outline" onClick={handleExportJSON} disabled={questions.length === 0}><FileJson className="h-3.5 w-3.5" />Export JSON</Button>
      <Button size="sm" variant="outline" onClick={() => handleImport('csv')}><Upload className="h-3.5 w-3.5" />Import CSV</Button>
      <Button size="sm" variant="outline" onClick={() => handleImport('json')}><Upload className="h-3.5 w-3.5" />Import JSON</Button>
      <Button size="sm" variant="ghost" onClick={handleDownloadSampleCSV}><Download className="h-3.5 w-3.5" />Sample CSV</Button>
      <Button size="sm" variant="ghost" onClick={handleDownloadSampleJSON}><Download className="h-3.5 w-3.5" />Sample JSON</Button>
    </div>
  );
}

export const McqImportExport = memo(McqImportExportComponent);
