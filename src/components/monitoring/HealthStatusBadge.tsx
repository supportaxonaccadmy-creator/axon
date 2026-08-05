import { memo } from 'react';
import { getHealthStatusColor } from '@/services/monitoring';
import type { HealthStatus } from '@/services/monitoring';

interface HealthStatusBadgeProps { status: HealthStatus; size?: 'sm' | 'md'; }

function HealthStatusBadgeComponent({ status, size = 'sm' }: HealthStatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  return <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${getHealthStatusColor(status)}`}><span className={`h-1.5 w-1.5 rounded-full ${status === 'healthy' ? 'bg-success-500' : status === 'degraded' ? 'bg-warning-500' : status === 'unhealthy' ? 'bg-error-500' : 'bg-neutral-400'}`} />{status}</span>;
}
export const HealthStatusBadge = memo(HealthStatusBadgeComponent);
