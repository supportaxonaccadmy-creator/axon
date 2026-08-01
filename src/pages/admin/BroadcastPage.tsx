import { useState, useMemo } from 'react';
import { Mail, Clock, AlertCircle, CheckCircle, RotateCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageComposer } from '@/components/notification';
import { emailService } from '@/services/notification';
import { useCurrentUser } from '@/hooks/useProfile';
import { useMessages } from '@/hooks/useMessages';
import { formatRelativeTime } from '@/services/notification';
import type { EmailLog } from '@/services/notification';
import { useEffect } from 'react';

export function BroadcastPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const { broadcast, sending, lastResult } = useMessages();
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchLogs = async () => {
    setLogsLoading(true);
    const { data } = await emailService.getLogs(20);
    setEmailLogs(data);
    setLogsLoading(false);
  };

  useEffect(() => { void fetchLogs(); }, []);

  const handleSend = async (input: Parameters<typeof broadcast>[1]) => {
    await broadcast(adminId, input);
    void fetchLogs();
  };

  const handleRetry = async (id: string) => {
    await emailService.retry(id);
    void fetchLogs();
  };

  const stats = useMemo(() => {
    const sent = emailLogs.filter((l) => l.status === 'sent').length;
    const failed = emailLogs.filter((l) => l.status === 'failed').length;
    const pending = emailLogs.filter((l) => l.status === 'pending').length;
    return [
      { label: 'Total Emails', value: String(emailLogs.length), icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
      { label: 'Sent', value: String(sent), icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
      { label: 'Pending', value: String(pending), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
      { label: 'Failed', value: String(failed), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
    ];
  }, [emailLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Broadcast Center</h1>
        <p className="mt-1 text-sm text-neutral-500">Send notifications to all students, specific batches, or individual students</p>
      </div>

      {lastResult && (
        <div className={`rounded-lg border px-4 py-3 ${lastResult.error ? 'border-error-200 bg-error-50' : 'border-success-200 bg-success-50'}`}>
          <p className={`text-sm font-medium ${lastResult.error ? 'text-error-700' : 'text-success-700'}`}>
            {lastResult.error ? `Error: ${lastResult.error}` : `Successfully sent to ${lastResult.recipientCount} recipient(s)`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Compose Message</CardTitle></CardHeader>
          <CardContent>
            <MessageComposer onSend={handleSend} sending={sending} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} hover>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
                      <p className="text-xs text-neutral-500">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader><CardTitle>Recent Email Logs</CardTitle></CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="py-4 text-center text-sm text-neutral-500">Loading...</div>
              ) : emailLogs.length === 0 ? (
                <div className="py-4 text-center text-sm text-neutral-500">No emails sent yet</div>
              ) : (
                <div className="space-y-2">
                  {emailLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center gap-2 rounded-lg border border-neutral-100 p-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-neutral-700">{log.subject}</p>
                        <p className="truncate text-[11px] text-neutral-400">{log.recipientEmail} · {formatRelativeTime(log.createdAt)}</p>
                      </div>
                      <Badge variant={log.status === 'sent' ? 'success' : log.status === 'failed' ? 'error' : 'warning'}>
                        {log.status}
                      </Badge>
                      {log.status === 'failed' && (
                        <button onClick={() => handleRetry(log.id)} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600" aria-label="Retry">
                          <RotateCw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
