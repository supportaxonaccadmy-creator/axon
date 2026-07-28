import { memo, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Option } from '@/types/common';
import type { Batch } from '@/types/lms';

interface StudentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  batches: Batch[];
  batchId: string;
  onBatchChange: (v: string) => void;
}

const STATUS_OPTIONS: Option[] = [
  { label: 'All Students', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Purchased', value: 'purchased' },
  { label: 'Free', value: 'free' },
];

function StudentFiltersComponent({ search, onSearchChange, status, onStatusChange, batches, batchId, onBatchChange }: StudentFiltersProps) {
  const batchOptions: Option[] = useMemo(() => [{ label: 'All Batches', value: '' }, ...batches.map((b) => ({ label: b.title, value: b.id }))], [batches]);
  const searchIcon = useMemo(() => <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />, []);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="relative flex-1 min-w-[200px]">{searchIcon}<Input placeholder="Search by name, email, mobile..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" /></div>
      <Select options={batchOptions} value={batchId} onChange={(e) => onBatchChange(e.target.value)} className="sm:w-48" />
      <Select options={STATUS_OPTIONS} value={status} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-44" />
    </div>
  );
}

export const StudentFilters = memo(StudentFiltersComponent);
