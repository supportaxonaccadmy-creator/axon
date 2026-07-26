import { memo } from 'react';
import { User, Mail, Calendar } from 'lucide-react';
import { useProfileDisplayName, useAvatar } from '@/hooks/useProfile';
import { Badge } from '@/components/ui/Badge';

function ProfileSummaryCardComponent() {
  const displayName = useProfileDisplayName();
  const avatarUrl = useAvatar();
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100">{avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-primary-600" />}</div>
        <div className="min-w-0"><p className="truncate text-lg font-bold text-neutral-900">{displayName}</p><Badge variant="primary" className="mt-1">Student</Badge></div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-500"><Mail className="h-4 w-4 shrink-0" /><span className="truncate">View profile for details</span></div>
        <div className="flex items-center gap-2 text-neutral-500"><Calendar className="h-4 w-4 shrink-0" /><span>Member since this year</span></div>
      </div>
    </div>
  );
}

export const ProfileSummaryCard = memo(ProfileSummaryCardComponent);
