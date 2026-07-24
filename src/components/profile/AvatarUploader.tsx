import { useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export interface AvatarUploaderProps {
  currentUrl: string | null;
  fullName: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  loading?: boolean | undefined;
  error?: string | null | undefined;
}

export function AvatarUploader({
  currentUrl,
  fullName,
  onUpload,
  onRemove,
  loading = false,
  error,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const initials = (fullName ?? '?')
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  function handleFileSelect(file: File | undefined) {
    if (file) onUpload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          'relative rounded-full transition-all',
          isDragging && 'ring-4 ring-primary-300 ring-offset-2',
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Avatar
          src={currentUrl ?? undefined}
          alt={fullName ?? 'Avatar'}
          fallback={initials}
          size="xl"
          className="ring-4 ring-primary-100"
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/60">
            <svg className="h-6 w-6 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-error-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          loading={loading}
          onClick={() => inputRef.current?.click()}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload
        </Button>
        {currentUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={onRemove}
          >
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-neutral-400">
        Drag and drop or click to upload. JPEG, PNG, WebP, GIF. Max 2MB.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files?.[0])}
      />
    </div>
  );
}
