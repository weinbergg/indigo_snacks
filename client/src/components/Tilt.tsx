import { useRef } from 'react';
import type { PointerEvent, PropsWithChildren } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform
} from 'framer-motion';

interface TiltProps {
  className?: string;
  /** Максимальный угол наклона в градусах. */
  max?: number;
  /** Небольшое увеличение при наведении. */
  scale?: number;
  /** Мягкий блик, следующий за курсором. */
  glare?: boolean;
}

export function Tilt({
  children,
  className = '',
  max = 8,
  scale = 1.02,
  glare = false
}: PropsWithChildren<TiltProps>) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springConfig = { stiffness: 190, damping: 16, mass: 0.35 };
  const sx = useSpring(px, springConfig);
  const sy = useSpring(py, springConfig);

  const rotateX = useTransform(sy, [0, 1], [max, -max]);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const glareBackground = useTransform(
    [sx, sy],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), transparent 45%)`
  );

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`preserve-3d ${className}`}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      {children}
      {glare ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBackground }}
        />
      ) : null}
    </motion.div>
  );
}
