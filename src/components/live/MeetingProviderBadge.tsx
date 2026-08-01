import { memo } from 'react';
import { cn } from '@/utils/cn';
import { Video, Globe, MonitorPlay, PlayCircle, ExternalLink } from 'lucide-react';
import type { MeetingProviderType } from '@/services/live';
import { PROVIDER_LABELS } from '@/services/live';

interface MeetingProviderBadgeProps {
  providerType: MeetingProviderType;
  className?: string | undefined;
}

const PROVIDER_ICONS: Record<MeetingProviderType, typeof Video> = {
  zoom: Video,
  google_meet: Globe,
  jitsi_meet: Globe,
  microsoft_teams: MonitorPlay,
  youtube_live: PlayCircle,
  custom_url: ExternalLink,
};

function MeetingProviderBadgeComponent({ providerType, className }: MeetingProviderBadgeProps) {
  const Icon = PROVIDER_ICONS[providerType] ?? ExternalLink;
  const label = PROVIDER_LABELS[providerType] ?? providerType;

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700', className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export const MeetingProviderBadge = memo(MeetingProviderBadgeComponent);