import { useState, useMemo, useCallback } from 'react';
import { Search, Video } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { RecordingCard, RecordingPlayer } from '@/components/live';
import { useRecordings } from '@/hooks/useRecordings';
import type { LiveRecording } from '@/services/live';

export function RecordingLibraryPage() {
  const { recordings, loading } = useRecordings();
  const [searchQuery, setSearchQuery] = useState('');
  const [playingRecording, setPlayingRecording] = useState<LiveRecording | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery) return recordings;
    const q = searchQuery.toLowerCase();
    return recordings.filter((r) => r.title.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q));
  }, [recordings, searchQuery]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Recording Library</h1>
        <p className="mt-1 text-sm text-neutral-500">Watch recorded live class sessions</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input value={searchQuery} onChange={handleSearch} placeholder="Search recordings..." className="pl-10" />
          </div>
        </CardContent>
      </Card>
      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading recordings...</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center justify-center py-12 text-center"><Video className="h-10 w-10 text-neutral-300" /><p className="mt-2 text-sm text-neutral-500">{searchQuery ? 'No recordings match your search' : 'No recordings available'}</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <RecordingCard
              key={r.id}
              recording={r}
              onPlay={(rec) => setPlayingRecording(rec)}
              onDownload={r.downloadUrl ? () => { if (r.downloadUrl) window.open(r.downloadUrl, '_blank'); } : undefined}
            />
          ))}
        </div>
      )}
      {playingRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPlayingRecording(null)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <RecordingPlayer recording={playingRecording} onClose={() => setPlayingRecording(null)} />
          </div>
        </div>
      )}
    </div>
  );
}