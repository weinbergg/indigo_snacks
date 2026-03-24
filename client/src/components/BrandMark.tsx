import { Link } from 'react-router-dom';

interface BrandMarkProps {
  compact?: boolean;
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      to="/"
      className="inline-flex min-w-0 items-center gap-2 text-ink transition hover:opacity-90 sm:gap-3"
      aria-label="На главную страницу Индиго"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand/20 bg-brand-soft/95 shadow-soft sm:h-12 sm:w-12">
        <span className="absolute inset-1 rounded-full border border-brand/15" />
        <img
          src="/assets/brand/dog-illustration.png"
          alt=""
          className="relative h-[82%] w-[82%] object-contain opacity-80"
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-display text-[1.8rem] uppercase tracking-[0.16em] sm:text-2xl sm:tracking-[0.22em]">
          Индиго
        </span>
        {!compact ? (
          <span className="-mt-1 text-[10px] uppercase tracking-[0.32em] text-muted">
            снеки из индейки
          </span>
        ) : null}
      </span>
    </Link>
  );
}
