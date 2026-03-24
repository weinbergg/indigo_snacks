import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-brand text-white shadow-soft hover:-translate-y-0.5 hover:bg-brand-deep focus-visible:outline-brand',
  secondary:
    'border border-line bg-white/70 text-ink hover:-translate-y-0.5 hover:border-brand/30 hover:bg-white focus-visible:outline-brand',
  ghost:
    'text-brand hover:bg-brand/8 focus-visible:outline-brand'
};

export function getButtonClassName({
  className = '',
  fullWidth,
  variant = 'primary'
}: Pick<ButtonProps, 'className' | 'fullWidth' | 'variant'>) {
  return [
    'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold tracking-[0.02em] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    className
  ].join(' ');
}

export const Button = forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
  ({ children, className = '', fullWidth, type = 'button', variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={getButtonClassName({ className, fullWidth, variant })}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = 'Button';
