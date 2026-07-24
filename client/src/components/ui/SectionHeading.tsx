interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left'
}: SectionHeadingProps) {
  const alignment = align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl';
  const eyebrowLayout = align === 'center' ? 'justify-center' : '';

  return (
    <div className={alignment}>
      <p
        className={`mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-brand ${eyebrowLayout}`}
      >
        <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-brand/60 to-transparent" />
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h2>
      <p className="mt-5 text-base leading-7 text-muted sm:text-lg">{description}</p>
    </div>
  );
}
