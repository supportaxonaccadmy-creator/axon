import { memo } from 'react';
import { cn } from '@/utils/cn';

interface SettingCardProps {
  title: string;
  description?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}

function SettingCardComponent({ title, description, children, className }: SettingCardProps) {
  return (
    <div className={cn('rounded-xl border border-neutral-200 bg-white p-6 shadow-sm', className)}>
      <div className="mb-4"><h3 className="text-sm font-semibold text-neutral-900">{title}</h3>{description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}</div>
      {children}
    </div>
  );
}

export const SettingCard = memo(SettingCardComponent);

interface ToggleSettingProps {
  label: string;
  description?: string | undefined;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSettingComponent({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div><p className="text-sm font-medium text-neutral-900">{label}</p>{description && <p className="text-xs text-neutral-500">{description}</p>}</div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors', checked ? 'bg-primary-600' : 'bg-neutral-200')}
      >
        <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
      </button>
    </div>
  );
}

export const ToggleSetting = memo(ToggleSettingComponent);

interface SectionHeaderProps {
  title: string;
  description?: string | undefined;
  icon?: React.ComponentType<{ className?: string | undefined }> | undefined;
}

function SectionHeaderComponent({ title, description, icon: Icon }: SectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">{Icon && <Icon className="h-5 w-5 text-primary-600" />}{title}</h2>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
    </div>
  );
}

export const SectionHeader = memo(SectionHeaderComponent);

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { variant: string; label: string }> = {
  operational: { variant: 'bg-success-100 text-success-700', label: 'Operational' },
  degraded: { variant: 'bg-warning-100 text-warning-700', label: 'Degraded' },
  down: { variant: 'bg-error-100 text-error-700', label: 'Down' },
  completed: { variant: 'bg-success-100 text-success-700', label: 'Completed' },
  failed: { variant: 'bg-error-100 text-error-700', label: 'Failed' },
  'in-progress': { variant: 'bg-primary-100 text-primary-700', label: 'In Progress' },
  active: { variant: 'bg-success-100 text-success-700', label: 'Active' },
  inactive: { variant: 'bg-neutral-100 text-neutral-600', label: 'Inactive' },
};

function StatusBadgeComponent({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { variant: 'bg-neutral-100 text-neutral-600', label: status };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', config.variant)}>{config.label}</span>;
}

export const StatusBadge = memo(StatusBadgeComponent);
