import { memo, useMemo } from 'react';
import { RotateCcw, Download, Printer } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Option } from '@/types/common';
import type { ReportFilters, ReportPeriod } from '@/types/reports';
import type { Batch, Subject, Chapter } from '@/types/lms';

interface ReportFiltersBarProps {
  filters: ReportFilters;
  onFilterChange: (key: keyof ReportFilters, value: string) => void;
  onReset: () => void;
  batches: Batch[];
  subjects: Subject[];
  chapters: Chapter[];
  onExportCSV: () => void;
  onPrint: () => void;
}

const PERIOD_OPTIONS: Option[] = [
  { label: 'Daily (14 days)', value: 'daily' },
  { label: 'Weekly (8 weeks)', value: 'weekly' },
  { label: 'Monthly (6 months)', value: 'monthly' },
  { label: 'All Time', value: 'all' },
];

const PAYMENT_OPTIONS: Option[] = [
  { label: 'All Payments', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' },
];

const ENROLLMENT_OPTIONS: Option[] = [
  { label: 'All Enrollments', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
];

function ReportFiltersBarComponent({ filters, onFilterChange, onReset, batches, subjects, chapters, onExportCSV, onPrint }: ReportFiltersBarProps) {
  const batchOptions: Option[] = useMemo(() => [{ label: 'All Batches', value: '' }, ...batches.map((b) => ({ label: b.title, value: b.id }))], [batches]);
  const subjectOptions: Option[] = useMemo(() => [{ label: 'All Subjects', value: '' }, ...subjects.map((s) => ({ label: s.title, value: s.id }))], [subjects]);
  const chapterOptions: Option[] = useMemo(() => [{ label: 'All Chapters', value: '' }, ...chapters.map((c) => ({ label: c.title, value: c.id }))], [chapters]);

  return (
    <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Period</label>
          <Select options={PERIOD_OPTIONS} value={filters.period} onChange={(e) => onFilterChange('period', e.target.value as ReportPeriod)} />
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">From Date</label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => onFilterChange('dateFrom', e.target.value)} />
        </div>
        <div className="min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">To Date</label>
          <Input type="date" value={filters.dateTo} onChange={(e) => onFilterChange('dateTo', e.target.value)} />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Batch</label>
          <Select options={batchOptions} value={filters.batchId} onChange={(e) => onFilterChange('batchId', e.target.value)} />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Subject</label>
          <Select options={subjectOptions} value={filters.subjectId} onChange={(e) => onFilterChange('subjectId', e.target.value)} />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Chapter</label>
          <Select options={chapterOptions} value={filters.chapterId} onChange={(e) => onFilterChange('chapterId', e.target.value)} />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Payment Status</label>
          <Select options={PAYMENT_OPTIONS} value={filters.paymentStatus} onChange={(e) => onFilterChange('paymentStatus', e.target.value)} />
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-medium text-neutral-500">Enrollment Status</label>
          <Select options={ENROLLMENT_OPTIONS} value={filters.enrollmentStatus} onChange={(e) => onFilterChange('enrollmentStatus', e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onReset}><RotateCcw className="h-3.5 w-3.5" />Reset Filters</Button>
        <Button size="sm" variant="outline" onClick={onExportCSV}><Download className="h-3.5 w-3.5" />Export CSV</Button>
        <Button size="sm" variant="outline" onClick={onPrint}><Printer className="h-3.5 w-3.5" />Print</Button>
      </div>
    </div>
  );
}

export const ReportFiltersBar = memo(ReportFiltersBarComponent);
