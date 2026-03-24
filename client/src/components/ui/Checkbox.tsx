import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ error, label, ...props }, ref) => (
    <label className="block">
      <span className="flex items-start gap-3 text-sm leading-6 text-muted">
        <input
          ref={ref}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-line text-brand focus:ring-brand"
          {...props}
        />
        <span>{label}</span>
      </span>
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  )
);

Checkbox.displayName = 'Checkbox';
