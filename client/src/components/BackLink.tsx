import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BackLinkProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackLink({
  to = '/',
  label = 'На главную',
  className = ''
}: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink ${className}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/70 transition group-hover:-translate-x-0.5 group-hover:border-brand/30">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </span>
      {label}
    </Link>
  );
}
