import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const radioId = id ?? props.name;

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            className={cn(
              'h-4 w-4 border-neutral-300 text-primary-600',
              'focus:ring-2 focus:ring-primary-500 focus:ring-offset-0',
              'cursor-pointer transition-colors',
              className,
            )}
            {...props}
          />
          {label && (
            <label htmlFor={radioId} className="text-sm text-neutral-700 cursor-pointer select-none">
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
      </div>
    );
  },
);

Radio.displayName = 'Radio';
