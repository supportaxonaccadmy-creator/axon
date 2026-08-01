import { memo } from 'react';
import { Award } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { CreateTemplateInput } from '@/services/gamification';

interface CertificateBuilderProps {
  template: Partial<CreateTemplateInput>;
  onChange: (template: Partial<CreateTemplateInput>) => void;
  onSave?: () => void;
  saving?: boolean | undefined;
  className?: string | undefined;
}

function CertificateBuilderComponent({ template, onChange, onSave, saving = false, className }: CertificateBuilderProps) {
  const update = (field: keyof CreateTemplateInput, value: unknown) => {
    onChange({ ...template, [field]: value });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-xl border-2 border-dashed border-neutral-200 p-8 text-center">
        <Award className="mx-auto h-12 w-12 text-primary-300" />
        <p className="mt-2 text-sm text-neutral-500">Certificate Template Preview</p>
        <p className="text-xs text-neutral-400">Background, logo, and signature will appear here</p>
      </div>

      <Input label="Template Name" value={template.name ?? ''} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Default Certificate" />
      <Textarea label="Description" value={template.description ?? ''} onChange={(e) => update('description', e.target.value)} placeholder="Template description..." rows={2} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Background URL" value={template.backgroundUrl ?? ''} onChange={(e) => update('backgroundUrl', e.target.value)} placeholder="https://..." />
        <Input label="Logo URL" value={template.logoUrl ?? ''} onChange={(e) => update('logoUrl', e.target.value)} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Signature URL" value={template.signatureUrl ?? ''} onChange={(e) => update('signatureUrl', e.target.value)} placeholder="https://..." />
        <Input label="Stamp URL" value={template.stampUrl ?? ''} onChange={(e) => update('stampUrl', e.target.value)} placeholder="https://..." />
      </div>

      {onSave && (
        <Button onClick={onSave} loading={saving} disabled={!template.name?.trim()}>
          Save Template
        </Button>
      )}
    </div>
  );
}

export const CertificateBuilder = memo(CertificateBuilderComponent);
