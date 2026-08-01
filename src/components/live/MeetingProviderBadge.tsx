import { memo } from 'react';
import { Video, Monitor, PlayCircle, Link2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PROVIDER_LABELS, PROVIDER_COLORS } from '@/services/live';
import type { MeetingProviderType } from '@/services/live';

const ICON_MAP: Record<MeetingProviderType, typeof Video> = {
  zoom: Video,
  google_meet: Monitor,
  jitsi_meet: Video,
  microsoft_teams: Monitor,
  youtube_live: PlayCircle,
  custom_url: Link2,
};

interface MeetingProviderBadgeProps {
  providerType: MeetingProviderType;
  className?: string | undefined;
}

function MeetingProviderBadgeComponent({ providerType, className }: MeetingProviderBadgeProps) {
  const Icon = ICON_MAP[providerType] ?? Link2;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', PROVIDER_COLORS[providerType], className)}>
      <Icon className="h-3 w-3" />
      {PROVIDER_LABELS[providerType]}
    </span>
  );
}

export const MeetingProviderBadge = memo(MeetingProviderBadgeComponent);
