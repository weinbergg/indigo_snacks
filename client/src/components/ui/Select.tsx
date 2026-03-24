import { forwardRef } from 'react';
import type { PropsWithChildren, SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<
  HTMLSelectElement,
  PropsWithChildren<SelectProps>
>(({ children, className = '', error, label, ...props }, ref) => (
  <label className="flex h-full flex-col">
    <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
    <select
      ref={ref}
      className={[
        'input-shell appearance-none bg-[right_1rem_center] pr-10',
        error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : '',
        className
      ].join(' ')}
      {...props}
    >
      {children}
    </select>
    {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
  </label>
));

Select.displayName = 'Select';
