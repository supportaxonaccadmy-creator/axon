import { memo } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Plus, RefreshCw } from 'lucide-react';

interface BatchHeaderProps {
  total: number;
  loading: boolean;
  onRefresh: () => void;
  onCreate: () => void;
}

function BatchHeaderComponent({ total, loading, onRefresh, onCreate }: BatchHeaderProps) {
  return (
    <PageHeader title="Batches" description={`${total} batch${total !== 1 ? 'es' : ''} total`} actions={
      <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh</Button><Button size="sm" onClick={onCreate}><Plus className="h-4 w-4" />New Batch</Button></div>
    } />
  );
}

export const BatchHeader = memo(BatchHeaderComponent);
