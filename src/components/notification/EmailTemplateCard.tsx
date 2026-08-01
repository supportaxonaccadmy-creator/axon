import { memo } from 'react';
import { Mail, Edit, Trash2, Copy } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { TEMPLATE_TYPE_LABELS, formatRelativeTime } from '@/services/notification';
import type { MessageTemplate } from '@/services/notification';

interface EmailTemplateCardProps {
  template: MessageTemplate;
  onEdit?: ((template: MessageTemplate) => void) | undefined;
  onDelete?: ((id: string) => void) | undefined;
  onDuplicate?: ((template: MessageTemplate) => void) | undefined;
  onToggleActive?: ((id: string, isActive: boolean) => void) | undefined;
}

function EmailTemplateCardComponent({ template, onEdit, onDelete, onDuplicate, onToggleActive }: EmailTemplateCardProps) {
  return (
    <div className={cn(
      'rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md',
      template.isActive ? 'border-neutral-200' : 'border-neutral-200 opacity-60',
    )}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <Mail className="h-5 w-5 text-blue-500" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">{template.name}</h3>
              <p className="text-xs text-neutral-500">{TEMPLATE_TYPE_LABELS[template.type]}</p>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant={template.isActive ? 'success' : 'default'}>
                {template.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-medium text-neutral-700">Subject: {template.subject}</p>
            <p className="text-xs text-neutral-500 line-clamp-2">{template.body}</p>
          </div>

          {template.variables.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {template.variables.map((v) => (
                <span key={v} className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-600">
                  {`{{${v}}}`}
                </span>
              ))}
            </div>
          )}

          <p className="mt-2 text-[11px] text-neutral-400">{formatRelativeTime(template.createdAt)}</p>

          <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
            {onEdit && (
              <button
                onClick={() => onEdit(template)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-primary-600 transition-colors hover:bg-primary-50"
              >
                <Edit className="h-3 w-3" /> Edit
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(template)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                <Copy className="h-3 w-3" /> Duplicate
              </button>
            )}
            {onToggleActive && (
              <button
                onClick={() => onToggleActive(template.id, !template.isActive)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-100"
              >
                {template.isActive ? 'Deactivate' : 'Activate'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(template.id)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-error-500 transition-colors hover:bg-error-50"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const EmailTemplateCard = memo(EmailTemplateCardComponent);
