interface BrandDogBadgeProps {
  className?: string;
  shapeInsetClassName?: string;
  fillClassName?: string;
  frameClassName?: string;
  dogClassName?: string;
  showInnerRings?: boolean;
  /** Плавное «дыхание» + периодический наклон головы. */
  animated?: boolean;
  alt?: string;
}

const dogMaskStyle = {
  WebkitMaskImage: 'url(/assets/brand/dog-opaque-mask.png)',
  maskImage: 'url(/assets/brand/dog-opaque-mask.png)',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskSize: 'contain',
  maskSize: 'contain'
} as const;

export function BrandDogBadge({
  className,
  shapeInsetClassName,
  fillClassName,
  frameClassName,
  dogClassName,
  showInnerRings = false,
  animated = false,
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
  const frameLayerClassName = [
    'pointer-events-none absolute inset-[8.5%] z-[1] opacity-80',
    frameClassName
  ]
    .filter(Boolean)
    .join(' ');
  const dogImageClassName = [
    'absolute inset-0 h-full w-full object-contain opacity-85',
    dogClassName
  ]
    .filter(Boolean)
    .join(' ');

  // Живой пёс: наклон головы вложен в «дыхание», заливка-подложка движется
  // вместе с иллюстрацией, чтобы линии фона не проступали по краям.
  const dogGroup = animated ? (
    <span className="absolute inset-0 z-[2] motion-safe:animate-[badge-breathe_7.5s_ease-in-out_infinite]">
      <span className="absolute inset-0 [transform-origin:50%_42%] motion-safe:animate-[dog-head-tilt_17s_ease-in-out_infinite]">
        <span className={fillLayerClassName} style={dogMaskStyle} />
        <img src="/assets/brand/dog-illustration.png" alt={alt} className={dogImageClassName} />
      </span>
    </span>
  ) : (
    <>
      <span className={fillLayerClassName} style={dogMaskStyle} />
      <img src="/assets/brand/dog-illustration.png" alt={alt} className={dogImageClassName} />
    </>
  );

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
      <span className={shapeLayerClassName}>{dogGroup}</span>
    </span>
  );
}
