import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, label, ...props }, ref) => (
    <label className="flex h-full flex-col">
      <span className="mb-2 block text-sm font-medium text-ink">{label}</span>
      <textarea
        ref={ref}
        className={[
          'input-shell min-h-36 resize-y py-4',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : '',
          className
        ].join(' ')}
        {...props}
      />
      {error ? <span className="mt-2 block text-sm text-red-600">{error}</span> : null}
    </label>
  )
);

Textarea.displayName = 'Textarea';
