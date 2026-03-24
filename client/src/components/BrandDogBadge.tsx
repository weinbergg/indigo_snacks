interface BrandDogBadgeProps {
  className?: string;
  fillClassName?: string;
  dogClassName?: string;
  alt?: string;
}

export function BrandDogBadge({
  className,
  fillClassName,
  dogClassName,
  alt = ''
}: BrandDogBadgeProps) {
  const badgeClassName = [
    'relative block overflow-hidden rounded-full bg-brand-soft shadow-soft',
    className
  ]
    .filter(Boolean)
    .join(' ');
  const fillLayerClassName = ['absolute inset-[11.5%] z-0 rounded-full bg-brand-soft', fillClassName]
    .filter(Boolean)
    .join(' ');
  const dogLayerClassName = ['relative z-10 h-full w-full object-contain opacity-85', dogClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClassName} aria-hidden="true">
      <span
        className={fillLayerClassName}
        style={{
          WebkitMaskImage: 'url(/assets/brand/dog-silhouette.png)',
          maskImage: 'url(/assets/brand/dog-silhouette.png)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain'
        }}
      />
      <img
        src="/assets/brand/dog-illustration.png"
        alt={alt}
        className={dogLayerClassName}
      />
    </span>
  );
}
