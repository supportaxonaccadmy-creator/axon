import { Megaphone, Pin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { AnnouncementCard, AnnouncementBanner } from '@/components/notification';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useCurrentUser } from '@/hooks/useProfile';

export function AnnouncementsPage() {
  const profile = useCurrentUser();
  const studentId = profile?.id ?? null;
  const { announcements, loading } = useAnnouncements(studentId, false);

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const regularAnnouncements = announcements.filter((a) => !a.isPinned);
  const bannerAnnouncement = pinnedAnnouncements[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Announcements</h1>
        <p className="mt-1 text-sm text-neutral-500">Stay updated with the latest news and announcements</p>
      </div>

      {bannerAnnouncement && (
        <AnnouncementBanner announcement={bannerAnnouncement} />
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-neutral-500">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="h-10 w-10 text-neutral-300" />
            <p className="mt-2 text-sm text-neutral-500">No announcements available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pinnedAnnouncements.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Pin className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-neutral-700">Pinned</h2>
              </div>
              <div className="space-y-4">
                {pinnedAnnouncements.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
            </div>
          )}

          {regularAnnouncements.length > 0 && (
            <div>
              {pinnedAnnouncements.length > 0 && (
                <h2 className="mb-2 text-sm font-semibold text-neutral-700">All Announcements</h2>
              )}
              <div className="space-y-4">
                {regularAnnouncements.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
