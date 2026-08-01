import { useState, useEffect, useMemo } from 'react';
import { Bell, Mail, AlertCircle, Send, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { notificationService } from '@/services/notification';
import { emailService } from '@/services/notification';
import { formatRelativeTime } from '@/services/notification';
import type { Notification } from '@/services/notification';
import { useCurrentUser } from '@/hooks/useProfile';
import { BroadcastDialog } from '@/components/notification';
import { useMessages } from '@/hooks/useMessages';

export function NotificationDashboardPage() {
  const profile = useCurrentUser();
  const adminId = profile?.id ?? '';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailStats, setEmailStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const { broadcast, sending } = useMessages();

  const fetchData = async () => {
    setLoading(true);
    const { data: notifs } = await notificationService.getAllForAdmin(20);
    setNotifications(notifs);
    const { data: stats } = await emailService.getStats();
    setEmailStats(stats);
    setLoading(false);
  };

  useEffect(() => { void fetchData(); }, []);

  const stats = useMemo(() => [
    { label: 'Total Sent', value: String(notifications.length), icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Emails Sent', value: String(emailStats.sent), icon: Mail, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Pending', value: String(emailStats.pending), icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Failed', value: String(emailStats.failed), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ], [notifications.length, emailStats]);

  const handleBroadcast = async (input: Parameters<typeof broadcast>[1]) => {
    await broadcast(adminId, input);
    void fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Notification Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage notifications and broadcast messages</p>
        </div>
        <Button onClick={() => setBroadcastOpen(true)}>
          <Send className="h-4 w-4" /> Broadcast
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs font-medium text-neutral-500">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-neutral-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-neutral-500">No notifications sent yet</div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                    <Bell className="h-4 w-4 text-primary-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{notif.title}</p>
                    <p className="truncate text-xs text-neutral-500">{notif.message}</p>
                  </div>
                  <Badge variant={notif.priority === 'urgent' ? 'error' : notif.priority === 'high' ? 'warning' : 'default'}>
                    {notif.priority}
                  </Badge>
                  <span className="text-xs text-neutral-400">{formatRelativeTime(notif.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <BroadcastDialog
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        onSend={handleBroadcast}
        sending={sending}
      />
    </div>
  );
}
