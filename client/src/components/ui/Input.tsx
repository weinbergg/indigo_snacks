import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, label, ...props }, ref) => (
    <label className="flex h-full flex-col">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <input
        ref={ref}
        className={[
          'input-shell',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : '',
          className
        ].join(' ')}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  )
);

Input.displayName = 'Input';
