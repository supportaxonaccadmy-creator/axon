import { memo, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PERMISSION_GROUPS } from '@/constants/settings';
import type { PermissionAction, RoleConfig } from '@/types/settings';

interface PermissionMatrixProps {
  role: RoleConfig;
  onToggle: (groupKey: string, action: PermissionAction) => void;
  onToggleGroup: (groupKey: string, allActions: PermissionAction[], enable: boolean) => void;
  onToggleAll: (enable: boolean) => void;
}

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View', create: 'Create', update: 'Update', delete: 'Delete', export: 'Export', publish: 'Publish', archive: 'Archive',
};

function PermissionMatrixComponent({ role, onToggle, onToggleGroup, onToggleAll }: PermissionMatrixProps) {
  const allEnabled = PERMISSION_GROUPS.every((g) => g.actions.every((a) => (role.permissions[g.key] ?? []).includes(a)));

  const handleGroupToggle = useCallback((groupKey: string, actions: PermissionAction[]) => {
    const current = role.permissions[groupKey] ?? [];
    const allOn = actions.every((a) => current.includes(a));
    onToggleGroup(groupKey, actions, !allOn);
  }, [role, onToggleGroup]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <span className="text-sm font-semibold text-neutral-900">Permission Matrix</span>
        <button
          type="button"
          onClick={() => onToggleAll(!allEnabled)}
          className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100"
        >
          {allEnabled ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200">
              <th className="py-2 text-left text-xs font-medium text-neutral-500">Module</th>
              {Object.values(ACTION_LABELS).map((label) => (
                <th key={label} className="px-2 py-2 text-center text-xs font-medium text-neutral-500">{label}</th>
              ))}
              <th className="px-2 py-2 text-center text-xs font-medium text-neutral-500">All</th>
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => {
              const roleActions = role.permissions[group.key] ?? [];
              const groupAllOn = group.actions.every((a) => roleActions.includes(a));
              return (
                <tr key={group.key} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-2.5 text-sm font-medium text-neutral-900">{group.label}</td>
                  {Object.keys(ACTION_LABELS).map((action) => {
                    const actionKey = action as PermissionAction;
                    const hasAction = group.actions.includes(actionKey);
                    const enabled = roleActions.includes(actionKey);
                    return (
                      <td key={action} className="px-2 py-2.5 text-center">
                        {hasAction ? (
                          <button
                            type="button"
                            onClick={() => onToggle(group.key, actionKey)}
                            aria-label={`${ACTION_LABELS[actionKey]} ${group.label}`}
                            className={cn(
                              'inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors',
                              enabled ? 'border-success-300 bg-success-500 text-white' : 'border-neutral-200 bg-white text-neutral-300 hover:border-neutral-300',
                            )}
                          >
                            {enabled ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          </button>
                        ) : (
                          <span className="text-neutral-200">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleGroupToggle(group.key, group.actions)}
                      aria-label={`Toggle all ${group.label}`}
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors',
                        groupAllOn ? 'border-primary-300 bg-primary-500 text-white' : 'border-neutral-200 bg-white text-neutral-300 hover:border-neutral-300',
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const PermissionMatrix = memo(PermissionMatrixComponent);
