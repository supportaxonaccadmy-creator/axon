import { memo, useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import type { LiveClass } from '@/services/live';
import { attendanceService } from '@/services/live';
import { formatDateTime } from '@/services/live';

interface WaitingRoomCardProps {
  liveClass: LiveClass;
  onAdmitAll?: (liveClass: LiveClass) => void;
  onAdmit?: (studentId: string) => void;
  className?: string | undefined;
}

interface WaitingParticipant {
  studentId: string;
  joinTime: string | null;
}

function WaitingRoomCardComponent({ liveClass, onAdmitAll, onAdmit, className }: WaitingRoomCardProps) {
  const [participants, setParticipants] = useState<WaitingParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    if (!liveClass.waitingRoom) { setParticipants([]); setLoading(false); return; }
    const { data } = await attendanceService.getByClass(liveClass.id);
    setParticipants(data.filter((a) => !a.leaveTime).map((a) => ({ studentId: a.studentId, joinTime: a.joinTime })));
    setLoading(false);
  }, [liveClass.id, liveClass.waitingRoom]);

  useEffect(() => {
    void fetchParticipants();
  }, [fetchParticipants]);

  if (!liveClass.waitingRoom) return null;

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          <Users className="mr-2 inline h-4 w-4" />
          Waiting Room
        </CardTitle>
        <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
          {participants.length} waiting
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4 text-sm text-neutral-500">Loading...</div>
        ) : participants.length === 0 ? (
          <div className="flex items-center justify-center py-4 text-sm text-neutral-500">No participants waiting</div>
        ) : (
          <div className="space-y-2">
            {participants.map((p) => (
              <div key={p.studentId} className="flex items-center justify-between rounded-lg border border-neutral-100 p-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
                    {p.studentId.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{p.studentId}</p>
                    {p.joinTime && (
                      <p className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(p.joinTime)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {onAdmit && (
                    <Button size="sm" variant="success" onClick={() => onAdmit(p.studentId)}>
                      <UserCheck className="h-3.5 w-3.5" />
                      Admit
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setParticipants((prev) => prev.filter((x) => x.studentId !== p.studentId))}>
                    <UserX className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {onAdmitAll && participants.length > 1 && (
              <Button size="sm" variant="primary" fullWidth onClick={() => onAdmitAll(liveClass)}>
                Admit All ({participants.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const WaitingRoomCard = memo(WaitingRoomCardComponent);