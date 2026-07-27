import { memo } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { LmsStatus } from '@/types/lms';

interface ContentStatusBadgeProps { status: LmsStatus; }

const config: Record<LmsStatus, { variant: 'success' | 'warning' | 'default'; label: string }> = {
  published: { variant: 'success', label: 'Published' },
  draft: { variant: 'warning', label: 'Draft' },
  archived: { variant: 'default', label: 'Archived' },
};

function ContentStatusBadgeComponent({ status }: ContentStatusBadgeProps) {
  const c = config[status] ?? config.draft;
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export const ContentStatusBadge = memo(ContentStatusBadgeComponent);
