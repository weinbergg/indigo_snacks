import type { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
  delay?: number;
  className?: string;
}

export function Reveal({
  children,
  className = '',
  delay = 0
}: PropsWithChildren<RevealProps>) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.35, delay }
          : { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }
      }
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
