interface BrandDogBadgeProps {
  className?: string;
  shapeInsetClassName?: string;
  fillClassName?: string;
  frameClassName?: string;
  dogClassName?: string;
  showInnerRings?: boolean;
  alt?: string;
}

export function BrandDogBadge({
  className,
  shapeInsetClassName,
  fillClassName,
  frameClassName,
  dogClassName,
  showInnerRings = false,
  alt = ''
}: BrandDogBadgeProps) {
  const badgeClassName = [
    'relative block overflow-hidden rounded-full bg-brand-soft shadow-soft',
    className
  ]
    .filter(Boolean)
    .join(' ');
  const shapeLayerClassName = ['absolute inset-0 z-[2]', shapeInsetClassName]
    .filter(Boolean)
    .join(' ');
  const fillLayerClassName = ['absolute inset-0 z-[1] bg-brand-soft', fillClassName]
    .filter(Boolean)
    .join(' ');
  const frameLayerClassName = ['pointer-events-none absolute inset-[8.5%] z-[1] opacity-80', frameClassName]
    .filter(Boolean)
    .join(' ');
  const dogLayerClassName = ['absolute inset-0 z-[2] h-full w-full object-contain opacity-85', dogClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={badgeClassName} aria-hidden="true">
      <span className={frameLayerClassName}>
        <img src="/assets/brand/brand-frame.svg" alt="" className="h-full w-full object-contain" />
      </span>
      {showInnerRings ? (
        <>
          <span className="pointer-events-none absolute inset-[8%] z-[1] rounded-full border border-brand/20" />
          <span className="pointer-events-none absolute inset-[18%] z-[1] rounded-full border border-brand/15" />
        </>
      ) : null}
      <span className={shapeLayerClassName}>
        <span
          className={fillLayerClassName}
          style={{
            WebkitMaskImage: 'url(/assets/brand/dog-opaque-mask.png)',
            maskImage: 'url(/assets/brand/dog-opaque-mask.png)',
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
    </span>
  );
}
