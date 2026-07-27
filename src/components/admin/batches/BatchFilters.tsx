import { memo, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Option } from '@/types/common';

interface BatchFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  pricingType: string;
  onPricingTypeChange: (v: string) => void;
}

const STATUS_OPTIONS: Option[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

const PRICING_OPTIONS: Option[] = [
  { label: 'All Pricing', value: 'all' },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
];

function BatchFiltersComponent({ search, onSearchChange, status, onStatusChange, pricingType, onPricingTypeChange }: BatchFiltersProps) {
  const searchIcon = useMemo(() => <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />, []);
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        {searchIcon}
        <Input placeholder="Search batches by title..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-10" />
      </div>
      <Select options={STATUS_OPTIONS} value={status} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-44" />
      <Select options={PRICING_OPTIONS} value={pricingType} onChange={(e) => onPricingTypeChange(e.target.value)} className="sm:w-44" />
    </div>
  );
}

export const BatchFilters = memo(BatchFiltersComponent);
