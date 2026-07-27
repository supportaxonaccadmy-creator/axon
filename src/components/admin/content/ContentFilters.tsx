import { memo, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Option } from '@/types/common';

interface ContentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  classOptions?: Option[];
  classValue?: string;
  onClassChange?: (v: string) => void;
  chapterOptions?: Option[];
  chapterValue?: string;
  onChapterChange?: (v: string) => void;
}

const STATUS_OPTIONS: Option[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

function ContentFiltersComponent({ search, onSearchChange, status, onStatusChange, classOptions, classValue, onClassChange, chapterOptions, chapterValue, onChapterChange }: ContentFiltersProps) {
  const searchIcon = useMemo(() => <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />, []);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="relative flex-1 min-w-[200px]">{searchIcon}<Input placeholder="Search by title..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" /></div>
      {classOptions && onClassChange && (<Select options={classOptions} value={classValue ?? ''} onChange={(e) => onClassChange(e.target.value)} className="sm:w-48" />)}
      {chapterOptions && onChapterChange && (<Select options={chapterOptions} value={chapterValue ?? ''} onChange={(e) => onChapterChange(e.target.value)} className="sm:w-48" />)}
      <Select options={STATUS_OPTIONS} value={status} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-44" />
    </div>
  );
}

export const ContentFilters = memo(ContentFiltersComponent);
