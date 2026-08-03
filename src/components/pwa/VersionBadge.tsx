import { memo } from 'react';
import { Tag } from 'lucide-react';
import { versionManager } from '@/services/pwa';

function VersionBadgeComponent() {
  const version = versionManager.getVersion();
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500" aria-label={`App version ${version.version}`}>
      <Tag className="h-3 w-3" />
      v{version.version}
    </div>
  );
}
export const VersionBadge = memo(VersionBadgeComponent);
