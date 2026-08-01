import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Trash2, Calendar, Clock, Video, Users, Lock, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LiveStatusBadge, MeetingProviderBadge, HostControls, AttendanceTable } from '@/components/live';
import { liveClassService, attendanceService } from '@/services/live';
import { useCurrentUser } from '@/hooks/useProfile';
import { formatDateTime } from '@/services/live';
import type { LiveClass, LiveAttendance } from '@/services/live';

export function LiveClassDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [attendance, setAttendance] = useState<LiveAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error: err } = await liveClassService.getById(id);
      if (err) setError(err);
      else setLiveClass(data);
      const { data: attData } = await attendanceService.getByClass(id);
      setAttendance(attData);
      setLoading(false);
    };
    void fetch();
  }, [id]);

  const handleDuplicate = async () => {
    if (!id) return;
    const { error: err } = await liveClassService.duplicate(id, adminId);
    if (!err) navigate('/admin/live-classes');
  };

  const handleDelete = async () => {
    if (!id) return;
    await liveClassService.delete(id);
    navigate('/admin/live-classes');
  };

  const handleStart = async () => {
    if (!id) return;
    await liveClassService.updateStatus(id, 'live');
    window.location.reload();
  };

  const handleEnd = async () => {
    if (!id) return;
    await liveClassService.updateStatus(id, 'completed');
    window.location.reload();
  };

  const handleCancel = async () => {
    if (!id) return;
    await liveClassService.updateStatus(id, 'cancelled');
    window.location.reload();
  };

  const handleExport = async () => {
    if (!id) return;
    const { data } = await attendanceService.exportCsv(id);
    if (data) {
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_${id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleOverrideStatus = async (studentId: string, status: import('@/services/live').AttendanceStatus) => {
    if (!id) return;
    await attendanceService.updateStatus(id, studentId, status, adminId);
    const { data } = await attendanceService.getByClass(id);
    setAttendance(data);
  };

  if (loading) return <div className="py-12 text-center text-sm text-neutral-500">Loading...</div>;
  if (error) return <div className="py-12 text-center text-sm text-error-600">{error}</div>;
  if (!liveClass) return <div className="py-12 text-center text-sm text-neutral-500">Live class not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{liveClass.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <LiveStatusBadge status={liveClass.status} />
              <MeetingProviderBadge providerType={liveClass.providerType} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/admin/live-classes/${id}/edit`)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Class Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {liveClass.description && <p className="text-sm text-neutral-600">{liveClass.description}</p>}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-neutral-600">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  {formatDateTime(liveClass.startTime, liveClass.timezone)}
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  Ends {formatDateTime(liveClass.endTime, liveClass.timezone)}
                </div>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Video className="h-4 w-4 text-neutral-400" />
                  {liveClass.meetingUrl}
                </div>
                {liveClass.maxParticipants && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Users className="h-4 w-4 text-neutral-400" /> Max {liveClass.maxParticipants}
                  </div>
                )}
                {liveClass.waitingRoom && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Lock className="h-4 w-4 text-neutral-400" /> Waiting Room
                  </div>
                )}
                {liveClass.autoRecording && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Radio className="h-4 w-4 text-neutral-400" /> Auto Recording
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <HostControls
            liveClass={liveClass}
            onStart={handleStart}
            onEnd={handleEnd}
            onCancel={handleCancel}
          />

          <Card>
            <CardHeader><CardTitle>Attendance ({attendance.length})</CardTitle></CardHeader>
            <CardContent>
              <AttendanceTable
                attendance={attendance}
                onExport={handleExport}
                onOverrideStatus={handleOverrideStatus}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
