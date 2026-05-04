import { Link } from 'react-router-dom';
import { BrandDogBadge } from './BrandDogBadge';

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
      <BrandDogBadge
        className="h-10 w-10 shrink-0 border border-brand/20 sm:h-12 sm:w-12"
        shapeInsetClassName="inset-[11%] -translate-y-[6%]"
        frameClassName="inset-[10.5%] -translate-y-[2.5%] opacity-80"
        dogClassName="opacity-90"
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-display text-[1.35rem] uppercase tracking-[0.13em] sm:text-[1.55rem] sm:tracking-[0.18em]">
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
