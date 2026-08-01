import { useState, useCallback } from 'react';
import { Search, Filter, Plus, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LiveClassCard } from '@/components/live';
import { useLiveClasses } from '@/hooks/useLiveClasses';
import { useNavigate } from 'react-router-dom';
import type { LiveClassStatus } from '@/services/live';
import type { Option } from '@/types/common';

export function LiveClassListPage() {
  const navigate = useNavigate();
  const { liveClasses, loading, error, filterByStatus, searchClasses } = useLiveClasses(true, null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    searchClasses(e.target.value || null);
  }, [searchClasses]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    filterByStatus(e.target.value ? (e.target.value as LiveClassStatus) : null);
  }, [filterByStatus]);

  const statusOptions: Option[] = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'live', label: 'Live Now' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Live Classes</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage all live classes and meetings</p>
        </div>
        <Button onClick={() => navigate('/admin/live-classes/new')}>
          <Plus className="h-4 w-4" /> Create Live Class
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input value={searchQuery} onChange={handleSearch} placeholder="Search live classes..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-400" />
              <Select options={statusOptions} value={statusFilter} onChange={handleStatusChange} className="min-w-40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-error-600">{error}</p>}

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>
      ) : liveClasses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Video className="h-10 w-10 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No live classes found</p>
            <Button className="mt-4" onClick={() => navigate('/admin/live-classes/new')}>
              <Plus className="h-4 w-4" /> Create Live Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {liveClasses.map((lc) => (
            <LiveClassCard key={lc.id} liveClass={lc} onClick={() => navigate(`/admin/live-classes/${lc.id}`)} showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
}
