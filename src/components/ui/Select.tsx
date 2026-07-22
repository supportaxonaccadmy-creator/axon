import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import type { Option } from '@/types/common';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, options, placeholder, ...props }, ref) => {
    const selectId = id ?? props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-neutral-900',
            'transition-colors appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-200'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-200',
            'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60',
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled ?? false}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-neutral-500">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
